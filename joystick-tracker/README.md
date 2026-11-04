# <.JoyStickRevenGe.> Boss Hunt Tracker: deploy guide

Everyone can VIEW. Only people with the editor passcode can EDIT.
Data is stored on Netlify (shared by all), and the passcode is checked on the server.

## Deploy (no coding needed)

1. Create a free account at github.com and make a new PRIVATE repository.
2. Upload ALL files from this folder to it (keep the folder structure:
   `public/index.html`, `netlify/functions/api.mjs`, `netlify.toml`, `package.json`).
3. Create a free account at netlify.com. Click "Add new site" > "Import an existing project",
   choose GitHub, and pick your repository. Leave the build settings as they are and deploy.
4. In Netlify, open Site configuration > Environment variables > Add a variable:
   - Key:   EDITOR_PASSCODE
   - Value: your secret passcode (use something long that is not used elsewhere)
   Set it for all scopes including Functions.
5. Go to Deploys > Trigger deploy > Deploy site, so the passcode takes effect.
6. Open your site link. Share it with everyone. Officers tap "Editor login" and enter the passcode.

## Day-to-day

- Change the passcode: edit EDITOR_PASSCODE in Netlify, then trigger a new deploy.
  Anyone who was logged in is locked out on their next save.
- Custom site name: Site configuration > Change site name.
- Backup: open `https://YOUR-SITE.netlify.app/api` in a browser and save the text.
  That is a full copy of your data.

## Notes

- If two officers save at the same moment, the second save is rejected with a notice and
  they just redo that action. Nothing gets silently overwritten.
- Viewers' pages refresh by themselves every 30 seconds.
