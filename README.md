# GrowbizApp: GitHub + Vercel

Static app with the current data (uploads/*.xlsx are loaded on first open) and a team access code gate (middleware.js).

## 1. Push to GitHub
Create a PRIVATE repository (the folder contains business data), then from this folder:

    git init && git add . && git commit -m "GrowbizApp"
    git branch -M main
    git remote add origin https://github.com/<you>/<repo>.git
    git push -u origin main

## 2. Import in Vercel
1. vercel.com > Add New > Project > import the repository.
2. Framework Preset: Other. Build command and Output directory: leave empty.
3. Environment Variables (before deploying):
   - ACCESS_CODE = the team code
   - SESSION_SECRET = a long random string (for example the output of: openssl rand -hex 32)
4. Deploy. Open the URL and sign in with the access code.

## Notes
- middleware.js protects every path, including the Excel files in uploads/. Without ACCESS_CODE and SESSION_SECRET the site returns an error and shows nothing.
- Data lives in each browser (localStorage); the seed files load once per browser. Watchlist, product and action plan decisions are not shared between people until the online database is connected.
- To change the code: edit ACCESS_CODE in Vercel and redeploy. Sessions last 7 days. Sign out is in the account menu.
- To update data: replace files in uploads/ and push, or upload through Data Import in the app.

## Install on a phone (PWA)
- Android (Chrome): menu > Install app.
- iPhone (Safari): Share > Add to Home Screen.
The app opens full screen with the GrowbizApp icon. On phones the sidebar becomes a menu drawer (the ☰ button). Video rows open the detail panel, which has a link to the video on TikTok.
- The manifest, icons and sw.js are the only files reachable without the access code.
