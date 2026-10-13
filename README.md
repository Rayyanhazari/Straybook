# Pawdex — Clean Gallery Fix

This update removes the redundant “Take a photo” button under “Add a photo”. The existing “Open scanner” and “Capture photo” controls remain, and “Choose from Gallery” is the only option in the Add a Photo section.

It keeps the existing localStorage key (`catdex_v1_collection`) so existing saved cats remain available in the same browser/device. It also adds a global `[hidden]` CSS rule so the empty photo preview image stays hidden until a real image is selected, and bumps the service-worker cache name to force updated app-shell assets to be fetched.

## Deploy
Upload the files in this folder to the root of the existing GitHub Pages repository, replacing files with matching names. Keep the `icons` folder structure. Commit the changes, wait for Pages deployment, then refresh the app. On Android, if the installed PWA still looks stale, fully close and reopen it after the new deployment.
