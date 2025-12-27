# 🚀 Hosting BondMetrics Pro on cPanel

Since this is a specific type of application (Node.js Backend + Static Frontend), follow this exact procedure to ensure everything works correctly on cPanel.

## 📦 Phase 1: Preparation (Local)
1.  **Delete** the `node_modules` folder inside your `server` directory (if it exists).
    *   *Why?* You should never upload `node_modules`. cPanel will install them for you.
2.  **Zip the Project**:
    *   Select **ALL** files in your `BondVerificationTools` folder (the `server` folder, `css`, `js`, all `.html` files).
    *   Right-click -> Send to -> Compressed (zipped) folder.
    *   Name it `bondmetrics-deploy.zip`.

---

## ☁️ Phase 2: Upload to cPanel
1.  Log in to your cPanel.
2.  Open **File Manager**.
3.  Navigate to the root directory (often `/home/yourusername/`).
4.  Create a new folder called `bondmetrics-app`.
5.  **Upload** `bondmetrics-deploy.zip` into this new folder.
6.  **Extract** the zip file here.
    *   *Result*: You should see `server`, `css`, `js`, and `Bond-Analysis-Tools-Hub.html` inside `/home/yourusername/bondmetrics-app/`.

---

## ⚙️ Phase 3: Setup Node.js App
1.  In cPanel, find the **"Setup Node.js App"** tool (under Software).
2.  Click **Create Application**.
3.  **Node.js Version**: Select **18.x** or **20.x** (Recommended).
4.  **Application Mode**: Select **Production**.
5.  **Application Root**: Enter `bondmetrics-app` (the folder you created).
6.  **Application URL**: Select your domain (`bondmetrics.pro`). Leave the sub-path empty to host at the root.
7.  **Application Startup File**: Enter `server/index.js`.
    *   *Crucial*: This tells cPanel where your server starts.
8.  Click **Create**.

---

## 📥 Phase 4: Install Dependencies
1.  Once created, the page will show your app details.
2.  **Important**: Ensure `package.json` is in the root of your `bondmetrics-app` folder (not inside `server`).
    *   *Note*: The "Run NPM Install" button requires `package.json` to be in the folder where the app is created.
3.  Click **Run NPM Install**.

---

## 🔄 Phase 6: Automated Deployment (Webhooks)
To automatically deploy when you push to GitHub, follow these steps:

### 1. Configure the `deploy.php` script
1.  Open `deploy.php` in your local project.
2.  **Edit Line 14**: Update `$REPO_DIR` to point to your **Git Repository folder** on the server.
    *   *Note*: This is likely different from your app folder. If you set up Git via cPanel, it's usually `repositories/your_repo_name`.
    *   Example: `$REPO_DIR = '/home/hypeiato/repositories/bondmetrics';`
3.  Upload `deploy.php` to your **public_html** or `bondmetrics-app` folder (wherever your specific domain points to).
    *   URL should be accessible: `https://bondmetrics.pro/deploy.php`

### 2. Add Webhook to GitHub
1.  Go to your GitHub Repository.
2.  Click **Settings** > **Webhooks** > **Add webhook**.
3.  **Payload URL**: `https://bondmetrics.pro/deploy.php`
4.  **Content type**: `application/json` (or default).
5.  **Just the push event**: Selected.
6.  Click **Add webhook**.

### 3. Test
1.  Push a change to GitHub.
2.  Check the "Recent Deliveries" in GitHub Webhook settings to see if it succeeded (Green checkmark).
3.  Check `deploy_log.txt` on your server (created next to `deploy.php`) to debug any errors.

---

## ✅ Phase 5: Verification
1.  Click the **Restart** button in the Node.js app interface.
2.  Visit `https://www.bondmetrics.pro`.
3.  **Test**:
    *   Does the homepage load? (Testing static file serving)
    *   Try logging in as admin (Testing API/Backend).
    *   Check if analytics are saving to `server/data/analytics.json`.

## 🛠️ Troubleshooting
*   **503 Error**: Means the Node.js server crashed. Check the `stderr.log` in your app folder.
*   **404 Not Found**: Verify that `server/index.js` uses `path.join(__dirname, '../')` to serve files (I already added this for you!).
*   **Permissions**: Ensure `server/data` folder has write permissions (chmod 755 or 777 usually required for JSON writing).
