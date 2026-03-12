# Setup Guide - Corrective Action Form SPFx Web Part

## Prerequisites

### 1. Node.js Version Requirement

⚠️ **IMPORTANT**: SPFx requires Node.js v18.x (not v16, v20, or v22)

**Current System:** You're running Node v22.14.0, which is not compatible.

### Installing Node v18

#### Option A: Using NVM (Recommended)

1. **Install NVM (Node Version Manager)**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. **Restart your terminal**, then install Node v18:
   ```bash
   nvm install 18
   nvm use 18
   ```

3. **Verify the version:**
   ```bash
   node --version
   # Should show: v18.x.x
   ```

4. **Set Node v18 as default for this project:**
   ```bash
   cd "/Users/kalebmartinez/Documents/projects/Ciracet -corrective-action"
   echo "18" > .nvmrc
   ```

   Now whenever you enter this directory, run `nvm use` to switch to Node v18.

#### Option B: Install Node v18 Directly

Download from: https://nodejs.org/dist/latest-v18.x/

⚠️ This will replace your current Node installation.

---

## Installation Steps

### 1. Switch to Node v18
```bash
nvm use 18
```

### 2. Install Dependencies
```bash
cd "/Users/kalebmartinez/Documents/projects/Ciracet -corrective-action"
npm install
```

### 3. Trust Development Certificate
```bash
gulp trust-dev-cert
```

### 4. Update SharePoint Site URL

Edit `config/serve.json` and replace with your SharePoint site:

```json
{
  "pageUrl": "https://YOUR-TENANT.sharepoint.com/sites/YOUR-SITE/SitePages/Home.aspx"
}
```

---

## Development Commands

### Start Local Development Server
```bash
npm run serve
```

This will:
- Build the project
- Start the local workbench
- Open your SharePoint site
- Allow you to add the web part to a page

### Build for Testing
```bash
npm run build
```

### Create Production Package
```bash
npm run package
```

This creates `corrective-action-form.sppkg` in `sharepoint/solution/`

---

## Deployment to SharePoint

### 1. Build Production Package
```bash
npm run package
```

### 2. Upload to App Catalog

1. Navigate to: `https://YOUR-TENANT.sharepoint.com/sites/appcatalog/AppCatalog`
2. Upload: `sharepoint/solution/corrective-action-form.sppkg`
3. Check: **"Make this solution available to all sites"**
4. Click **Deploy**

### 3. Add to Your Site

1. Go to your SharePoint site
2. Click **Settings** → **Add an app**
3. Search for: "corrective-action-form"
4. Click **Add**

### 4. Add Web Part to Page

1. Edit any page
2. Click **+** (Add section)
3. Search for: **"Corrective Action Form"**
4. Add it to your page
5. **Publish** the page

---

## Troubleshooting

### Issue: Node Version Error
```
Error: Your dev environment is running NodeJS version v22.14.0...
```

**Solution:** Switch to Node v18
```bash
nvm use 18
```

### Issue: Cannot find module '@pnp/sp'
```bash
npm install @pnp/sp --save
```

### Issue: Certificate Trust Error
```bash
gulp trust-dev-cert
```

### Issue: Port 4321 Already in Use
```bash
# Kill the process using port 4321
lsof -ti:4321 | xargs kill -9
```

### Issue: Build Errors After Code Changes
```bash
gulp clean
npm run build
```

---

## Project Structure

```
src/
├── webparts/
│   └── correctiveActionForm/
│       ├── components/
│       │   ├── CorrectiveActionFormApp.tsx    # Main routing component
│       │   ├── CorrectiveActionForm.tsx       # Form with auto-population
│       │   ├── Dashboard.tsx                  # User's corrective actions
│       │   └── FormFields.tsx                 # Reusable components
│       ├── models/
│       │   └── ICorrectiveAction.ts          # TypeScript interfaces
│       ├── services/
│       │   └── SharePointService.ts          # SharePoint data operations
│       └── CorrectiveActionFormWebPart.ts    # Web part entry point
```

---

## SharePoint List Requirements

Your lists are already created! The web part expects:

### Non Conformities List
- Used for auto-population
- Must have columns documented in [FIELD-MAPPING.md](FIELD-MAPPING.md)

### Corrective Actions List
- Stores the corrective action data
- Must have all columns documented in [FIELD-MAPPING.md](FIELD-MAPPING.md)

See [FIELD-MAPPING.md](FIELD-MAPPING.md) for complete column mapping.

---

## Testing Locally

1. **Start the dev server:**
   ```bash
   npm run serve
   ```

2. **Your browser will open to your SharePoint site**

3. **Add the web part:**
   - Edit the page
   - Add the "Corrective Action Form" web part
   - The web part will load from your local server

4. **Test the functionality:**
   - Select an NC from the dropdown
   - Verify auto-population works
   - Fill in Action Plan steps
   - Save and verify it creates an item in SharePoint

---

## Common Development Workflow

```bash
# 1. Switch to Node v18
nvm use 18

# 2. Make code changes
# Edit files in src/

# 3. Test locally
npm run serve

# 4. When ready to deploy
npm run package

# 5. Upload to SharePoint App Catalog
```

---

## VS Code Configuration (Optional)

Create `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.formatOnSave": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/lib": true,
    "**/temp": true,
    "**/*.sppkg": true
  }
}
```

---

## Support

For issues specific to this project, see:
- [FIELD-MAPPING.md](FIELD-MAPPING.md) - Column mapping reference
- [README.md](README.md) - General project documentation

For SPFx issues:
- https://docs.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview

---

**Ready to start development?**

```bash
nvm use 18
npm run serve
```
