import { getStore } from "@netlify/blobs";
import { timingSafeEqual } from "node:crypto";

const KEYS = ["players", "bosses", "items", "kills", "redemptions"];
const OPTIONAL = ["donations", "inventory"]; // older data may not have these yet

const json = (o, s = 200) =>
  new Response(JSON.stringify(o), {
    status: s,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

function authed(req) {
  const real = process.env.EDITOR_PASSCODE || "";
  const given = req.headers.get("x-passcode") || "";
  if (!real || given.length !== real.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(real));
}

export default async (req) => {
  const store = getStore({ name: "tracker", consistency: "strong" });
  const url = new URL(req.url);

  // Anyone can read.
  if (req.method === "GET") {
    if (url.searchParams.has("check")) {
      return authed(req) ? json({ ok: true }) : json({ ok: false }, 401);
    }
    const data = await store.get("data", { type: "json" });
    return json(data || { rev: 0, state: null });
  }

  // Only people with the editor passcode can write.
  if (req.method === "POST") {
    if (!authed(req)) return json({ error: "unauthorized" }, 401);

    const raw = await req.text();
    if (raw.length > 2_000_000) return json({ error: "too large" }, 413);

    let body;
    try { body = JSON.parse(raw); } catch { return json({ error: "bad json" }, 400); }

    const s = body && body.state;
    if (!s || !KEYS.every((k) => Array.isArray(s[k]))) return json({ error: "bad state" }, 400);

    // Stops two editors from silently overwriting each other.
    const cur = (await store.get("data", { type: "json" })) || { rev: 0, state: null };
    if (body.baseRev !== cur.rev) return json(cur, 409);

    const next = {
      rev: cur.rev + 1,
      state: Object.fromEntries([...KEYS, ...OPTIONAL].map((k) => [k, Array.isArray(s[k]) ? s[k] : []])),
    };
    await store.setJSON("data", next);
    return json({ rev: next.rev });
  }

  return json({ error: "method not allowed" }, 405);
};

export const config = { path: "/api" };
