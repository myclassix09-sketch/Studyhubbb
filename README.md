# Studyhub — CBSE Class 10 Learning Portal

Studyhub is a comprehensive educational platform for CBSE Class 10 Mathematics and Science, featuring interactive chapters, practice quizzes, PDF resources, administrator management, and a multi-turn AI Tutor powered by Gemini.

---

## 🔐 Administrator Access Credentials

To access the Administrator Portal:
- Click **"Admin Access"** in the footer or visit `/admin-login` (or click "Administrator Portal" on the sign-in screen).
- **Admin ID**: `Himanshu00` (or `admin@studyhub.edu` / `himanshu00@studyhub.edu`)
- **Admin Password**: `S@tudyhubb`
- **Google Sign-In**: Authorized for `myclassix09@gmail.com`

---

## 🚀 Publishing to GitHub Pages (Solved & Ready)

If you previously encountered a **blank page** after publishing to GitHub Pages, all issues have been solved. You can choose either of these two methods:

### Method 1: GitHub Actions (Recommended — 100% Automated)
1. In your GitHub repository, go to **Settings** → **Pages**.
2. Under **"Build and deployment"** → **Source**, select **"GitHub Actions"**.
3. Push to `main` (or run the workflow manually from the **Actions** tab).
4. GitHub Actions builds the project and deploys the static files directly.

### Method 2: Deploy from Branch (`/docs` folder)
1. Run `npm run build`. This generates both `dist/` and `docs/` (with `.nojekyll` and `404.html`).
2. Commit and push the `docs/` folder to GitHub.
3. Go to **Settings** → **Pages**.
4. Under **"Build and deployment"** → **Source**, select **"Deploy from a branch"**.
5. Choose branch **`main`** and folder **`/docs`**, then click **Save**.

### What Was Fixed to Prevent Blank Pages:
1. **Generated `docs/` directory** with pre-built production bundles so GitHub Pages has precompiled assets ready.
2. **Added `.nojekyll`** in both `dist/` and `docs/` to disable Jekyll asset filtering.
3. **SPA `404.html` fallback** so client-side routes don't return 404 when refreshed.
4. **Trailing-slash URL normalizer** in `index.html` ensuring relative `./assets/` always resolve correctly in repository subpaths.
5. **React ErrorBoundary** wrapped around the root component to eliminate silent white-screen crashes.
6. **Firebase loading safety timeout** so slow network or adblockers never trap the app on a perpetual loading screen.

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
```
