# Pawdex — Cute UI Update 🐈

A free, local-first street-cat collector. Take a photo, give the cat a nickname, record where you spotted it, and build your own collection.

## Features
- Camera capture (when opened on localhost or HTTPS) or photo upload
- Compresses photos before saving to reduce storage use
- Nicknames, appearance, location, and field notes
- Browse records, filter the collection, rename or delete entries
- Export/import a JSON backup
- No account, API key, AI service, or paid subscription required

## Run it in VS Code (Windows)

1. Extract the ZIP into a folder.
2. Open that folder in VS Code.
3. Install the **Live Server** extension if you don't already have it.
4. Right-click `index.html` and choose **Open with Live Server**.
5. Allow camera permission when your browser asks.

You can also run a local server with Python from this folder:

```powershell
py -m http.server 8000
```

Then open `http://localhost:8000` in your browser. Camera permission is normally available on localhost. If camera access doesn't work, use **Choose a photo** instead.

## Important notes
- Your cat collection is saved in this browser's local storage on this device. It does not automatically sync to your phone or another computer.
- Use **Export backup** regularly. Keep the downloaded JSON file somewhere safe; it contains your photos and notes.
- Browser storage has limits. Very large collections may eventually fill it.
- This version does not use AI and does not automatically identify cat breeds or recognize repeat encounters.
- Internet is not needed for the app's core features once the files are on your computer. The optional Google Fonts import in `style.css` may use the internet; the app falls back to system fonts if unavailable.
- Be kind to cats: don't chase, corner, or disturb them for a photo.


## Install on Android (home-screen app)

This project includes a PWA manifest, icons, and a service worker. To install it on Android:
1. Host the files on an HTTPS static site (GitHub Pages is free).
2. Open the published HTTPS URL in Chrome on Android.
3. Open Chrome's three-dot menu and choose **Install app** or **Add to Home screen**.
4. After the first visit, the app shell can load offline. Camera permission still depends on browser/device support.

The cat collection remains in that browser's local storage; it does not sync automatically to other devices.
