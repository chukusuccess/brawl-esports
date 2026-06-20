# AfroBrawlers

The African Brawlhalla community hub. The public site reads community content from Firestore when configured and falls back to browser storage for offline/local development.

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:4000](http://localhost:4000). The content desk is at `/admin`.

## Firebase + Firestore setup

1. In the [Firebase Console](https://console.firebase.google.com/), create a project (or select the project that will own AfroBrawlers).
2. In **Project settings → Your apps**, add a **Web app**. Copy its configuration values.
3. Copy `.env.example` to `.env.local` and add the values from the Firebase Web app configuration. These `NEXT_PUBLIC_` values identify the web app; they are not secrets. Firestore Security Rules protect the data.

   ```bash
   copy .env.example .env.local
   ```

4. In **Build → Firestore Database**, create a Cloud Firestore database. Start in production mode and choose the region nearest to your audience.
5. In **Build → Authentication → Sign-in method**, enable **Email/Password**.
6. In **Authentication → Users**, create the admin email/password account that will sign in at `/admin`.
7. In **Firestore Database → Rules**, publish this rule, replacing the email with that admin account:

   ```txt
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /siteContent/community {
         allow read: if true;
         allow write: if request.auth != null
                      && request.auth.token.email == 'your-admin@example.com';
       }
     }
   }
   ```

8. Restart `pnpm dev`, visit `/admin`, and sign in with the Firebase user from step 6. Make an edit. The app creates/updates the `siteContent/community` document automatically; the public homepage listens to the same document in real time.
9. Open the homepage in a private window or another browser. Your edit should be visible there too.

### Local fallback

When Firebase variables are absent, edits remain in that browser's local storage. This is useful for designing locally. The fallback credentials are `admin@email.com` / `admin1234`; they are deliberately only a local-development convenience, not production authentication. Do not deploy with Firebase disabled.

## Metadata

Set `NEXT_PUBLIC_SITE_URL` to the deployed domain before launch. It drives the canonical URL, Open Graph metadata, `robots.txt`, and `sitemap.xml`.

## Optional Brawlhalla API

`lib/brawlhalla.functions.ts` includes a server-side helper for a later API route or scheduled ranking sync. Add `BRAWLHALLA_API_KEY` (without `NEXT_PUBLIC_`) to `.env.local` when you use it.
