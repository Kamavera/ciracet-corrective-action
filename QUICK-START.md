# 🚀 Quick Start Guide

## One-Command Setup

Run this script to automatically install everything:

```bash
cd "/Users/kalebmartinez/Documents/projects/Ciracet -corrective-action"
./setup.sh
```

This will:
1. Install NVM (Node Version Manager)
2. Install Node.js v18
3. Install all dependencies
4. Build the project

---

## Manual Setup (If Script Fails)

### Step 1: Install NVM
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

**Close and reopen your terminal**, then:

### Step 2: Install Node v18
```bash
nvm install 18
nvm use 18
```

### Step 3: Install Dependencies & Build
```bash
cd "/Users/kalebmartinez/Documents/projects/Ciracet -corrective-action"
npm install
npm run build
```

---

## Before Running Development Server

### Update SharePoint Site URL

Edit `config/serve.json`:

```json
{
  "pageUrl": "https://YOUR-TENANT.sharepoint.com/sites/YOUR-SITE/SitePages/Home.aspx"
}
```

Replace:
- `YOUR-TENANT` with your SharePoint tenant name
- `YOUR-SITE` with your site name

---

## Development Commands

```bash
# Start development server (opens SharePoint site)
npm run serve

# Build for testing
npm run build

# Create deployment package
npm run package
```

---

## Deployment to SharePoint

### 1. Build Package
```bash
npm run package
```

### 2. Upload to App Catalog

1. Go to: `https://YOUR-TENANT.sharepoint.com/sites/appcatalog/AppCatalog`
2. Upload: `sharepoint/solution/corrective-action-form.sppkg`
3. Check: ☑️ **"Make available to all sites"**
4. Click: **Deploy**

### 3. Install on Your Site

1. Go to your site
2. **Settings** → **Add an app**
3. Find: **corrective-action-form**
4. Click: **Add**

### 4. Add to a Page

1. Edit any page
2. Click **+** (add section)
3. Search: **Corrective Action Form**
4. Add and Publish

---

## 🎯 Features

✅ **Auto-Population**: Select NC → form fills automatically
✅ **Smart ID Generation**: NC 2024-03 → AC 2024-03
✅ **Conditional Fields**: Show/hide based on YES/NO choices
✅ **User Filtering**: See only your own corrective actions
✅ **Search & Filter**: Dashboard with real-time search
✅ **Create & Edit**: Full CRUD operations

---

## 📋 Cheat Sheet

| Task | Command |
|------|---------|
| Switch to Node v18 | `nvm use 18` |
| Install dependencies | `npm install` |
| Build project | `npm run build` |
| Start dev server | `npm run serve` |
| Create package | `npm run package` |
| Clean build | `gulp clean` |
| Trust certificate | `gulp trust-dev-cert` |

---

## 📚 Documentation

- **[SETUP-GUIDE.md](SETUP-GUIDE.md)** - Detailed setup instructions
- **[FIELD-MAPPING.md](FIELD-MAPPING.md)** - SharePoint column mapping
- **[README.md](README.md)** - Complete project documentation

---

## 🆘 Quick Troubleshooting

**Problem: Node version error**
```bash
nvm use 18
```

**Problem: Build fails**
```bash
gulp clean
npm install
npm run build
```

**Problem: Port 4321 in use**
```bash
lsof -ti:4321 | xargs kill -9
```

**Problem: Certificate error**
```bash
gulp trust-dev-cert
```

---

## 🎉 You're Ready!

```bash
./setup.sh
# or manually:
nvm use 18
npm run serve
```

Open SharePoint → Edit page → Add "Corrective Action Form" web part
