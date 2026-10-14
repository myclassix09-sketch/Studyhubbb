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

## 🚀 Why Was GitHub Pages Showing a Blank Page & How It's Solved

The live site at `https://myclassix09-sketch.github.io/Studyhubbb/` was showing a blank screen because GitHub Pages was serving the **raw uncompiled repository root** `index.html` (which points to `/src/main.tsx` — a raw TypeScript React source file that browsers cannot execute).

### 2 Quick Steps to Make It Live in 30 Seconds:

### Option 1: GitHub Actions (Recommended — Automatic Deploy on Every Push)

1. **Enable GitHub Pages for Actions**:
   - In your repository `myclassix09-sketch/Studyhubbb`, go to **Settings** ➔ **Pages**.
   - Under **"Build and deployment"** ➔ **Source**, select **"GitHub Actions"** from the dropdown.
2. **Make Sure Workflows are Enabled**:
   - Click the **Actions** tab in your repository.
   - If GitHub shows a yellow banner ("Workflows aren't being run on this repository"), click **"Enable workflows"** (or "I understand my workflows, go ahead and enable them").
   - Under **Settings** ➔ **Actions** ➔ **General**, ensure **Workflow permissions** is set to **"Read and write permissions"**.
3. **Trigger the Workflow**:
   - In the **Actions** tab, select **"Deploy to GitHub Pages"** on the left menu.
   - Click the **"Run workflow"** dropdown on the right and click the green **"Run workflow"** button.
   - Within 1–2 minutes, GitHub will build the app and deploy it live to `https://myclassix09-sketch.github.io/Studyhubbb/`!

---

### Option 2: Deploy from Branch (`/docs` folder — No Actions Needed)

The project includes an automatic pre-compiled `docs/` folder with all production assets, `.nojekyll`, and `404.html`.

1. Commit and push the repository to GitHub (including the `docs/` folder).
2. Go to **Settings** ➔ **Pages** in your repository.
3. Under **"Build and deployment"** ➔ **Source**, choose **"Deploy from a branch"**.
4. Set Branch: **`main`** and Folder: **`/docs`**.
5. Click **Save**.
6. Your site will immediately be live and working!

---

### What Has Been Fixed in the Codebase:
1. **GitHub Workflow (`.github/workflows/deploy.yml`)**:
   - Upgraded to multi-branch trigger (`branches: ['**']`) and manual trigger (`workflow_dispatch`).
   - Uses Node 20 LTS runner with clean installation and separate `build` and `deploy` jobs following GitHub's official Pages standard.
2. **SPA Routing & Jekyll Bypass**:
   - Added `.nojekyll` to root, `dist/`, and `docs/` so GitHub Pages never ignores `_` or assets.
   - Created `404.html` in both `dist/` and `docs/` so page reloads do not return 404 errors.
3. **URL Normalizer in `index.html`**:
   - Ensures trailing slashes on subpath URLs (`/Studyhubbb/`) so relative `./assets/` always resolve correctly.
4. **React ErrorBoundary**:
   - Wrapped `App` in an ErrorBoundary so unexpected runtime crashes display a recovery screen instead of a blank page.
5. **Smart Initial Loader**:
   - If root `index.html` is ever served on GitHub Pages, it displays a branded loader and setup assistant instead of a blank white page.
6. **Firebase Loading Safeguard**:
   - Added a 2.5-second fallback timer so network delays or adblockers never block the app loading screen.
