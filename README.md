# Corrective Action Form - SharePoint SPFx Web Part

A production-ready SharePoint Framework (SPFx) web part for creating and managing Corrective Actions with automatic data population from Non Conformities list.

## Features

✅ **Auto-Population**: Automatically fetches and populates data from Non Conformities list when NC Reference ID is selected
✅ **Smart Reference ID Generation**: Converts NC-2025-XX to AC-2025-XX automatically
✅ **Dual View Mode**: Dashboard view to see all your corrective actions + Form view for create/edit
✅ **Row-Level Security**: Users only see corrective actions they created
✅ **Conditional Logic**: Shows additional fields when "More Actions Needed" is enabled
✅ **Responsive Design**: Works on desktop, tablet, and mobile devices
✅ **Real-time Search**: Filter dashboard by title, status, reference ID, or NC report number
✅ **Status Indicators**: Color-coded status badges and overdue date highlighting
✅ **Validation**: Built-in form validation with user-friendly error messages

## Prerequisites

- Node.js v16.x or v18.x
- SharePoint Online tenant
- Global administrator or SharePoint administrator access
- SPFx development environment set up

## SharePoint Lists Required

### 1. Non Conformities List
Create a SharePoint list named **"Non Conformities"** with the following columns:

| Column Name | Type | Required |
|------------|------|----------|
| Title | Single line of text | Yes |
| NCReferenceID | Single line of text | Yes |
| IssueDescription | Multiple lines of text | No |
| CauseAndEffectAnalysis1 | Multiple lines of text | No |
| CauseAndEffectAnalysis2 | Multiple lines of text | No |
| CauseAndEffectAnalysis3 | Multiple lines of text | No |
| CauseAndEffectAnalysis4 | Multiple lines of text | No |
| CauseAndEffectAnalysis5 | Multiple lines of text | No |
| RootCause | Multiple lines of text | No |
| PlaceOfNC | Single line of text | No |
| ResponsiblePerson | Single line of text | No |
| DueDate | Date and Time | No |

### 2. Corrective Actions List
Create a SharePoint list named **"Corrective Actions"** with the following columns:

| Column Name | Type | Required |
|------------|------|----------|
| Title | Single line of text | Yes |
| Status | Choice (Open, In Progress, Completed, Closed) | Yes |
| NCReportNumber | Single line of text | Yes |
| CorrectiveActionReferenceID | Single line of text | Yes |
| PlaceOfNC | Single line of text | No |
| DueDate | Date and Time | No |
| ResponsiblePerson | Single line of text | No |
| IssueDescription | Multiple lines of text | No |
| CauseAndEffectAnalysis1-5 | Multiple lines of text | No |
| RootCause | Multiple lines of text | No |
| CompletionDate | Date and Time | No |
| VerifiedBy | Single line of text | No |
| ActionPlanStep1-5 | Multiple lines of text | No |
| ActionPlanStep1-5ResponsiblePerson | Single line of text | No |
| ActionPlanStep1-5DueDate | Date and Time | No |
| MoreActionsNeeded | Yes/No | No |
| FollowUpNeededAction3-5 | Multiple lines of text | No |
| ActionEffectivenessVerification | Multiple lines of text | No |
| QAAuditor | Single line of text | No |
| Comments | Multiple lines of text | No |
| CCList | Single line of text | No |
| CAPAStatus | Choice (Not Started, In Progress, Completed, Verified) | No |
| IsRiskAlreadyIdentified | Yes/No | No |
| UpdateRiskAnalysisMatrix | Multiple lines of text | No |

## Installation

### 1. Clone and Install Dependencies

```bash
cd /Users/kalebmartinez/Documents/projects/Ciracet\ -corrective-action
npm install
```

### 2. Trust the Development Certificate

```bash
gulp trust-dev-cert
```

### 3. Update Configuration

Edit `config/serve.json` and update the `pageUrl` with your SharePoint site URL:

```json
{
  "pageUrl": "https://yourtenant.sharepoint.com/sites/yoursite/SitePages/Home.aspx"
}
```

## Development

### Run in Local Development Mode

```bash
npm run serve
```

This will:
- Start the local development server
- Open your SharePoint page
- Allow you to add the web part to the page

### Build for Production

```bash
npm run build
```

### Create Deployment Package

```bash
npm run package
```

This creates a `.sppkg` file in the `sharepoint/solution` folder.

## Deployment

### 1. Upload to App Catalog

1. Navigate to your SharePoint App Catalog
2. Upload the `.sppkg` file from `sharepoint/solution/corrective-action-form.sppkg`
3. Check "Make this solution available to all sites in the organization"
4. Click **Deploy**

### 2. Add to SharePoint Site

1. Go to your SharePoint site
2. Click **Settings** → **Add an app**
3. Find "corrective-action-form-client-side-solution"
4. Click **Add**

### 3. Add Web Part to Page

1. Edit a SharePoint page
2. Click **+** to add a web part
3. Search for "Corrective Action Form"
4. Add it to the page
5. Save and publish

## Usage

### Dashboard View

- View all corrective actions you created
- Search and filter items
- Click on any item to edit
- Click "New Corrective Action" to create a new one

### Creating a Corrective Action

1. Click **New Corrective Action**
2. Select an **NC Report Number** from the dropdown
3. Data will auto-populate from the Non Conformities list
4. The **Corrective Action Reference ID** is generated automatically
5. Fill in the Action Plan steps
6. Toggle "More Actions Needed" if additional actions are required
7. Complete verification and audit fields
8. Click **Submit**

### Editing a Corrective Action

1. Click on the item from the dashboard
2. Make your changes
3. Click **Update**

## Configuration Options

The web part includes the following configuration options in the property pane:

- **Web Part Title**: Customize the title displayed
- **Show Dashboard View**: Toggle between dashboard and form-only mode
- **Default View**: Choose which view to show first (Dashboard or Form)
- **Item ID**: For direct linking to a specific item

## Project Structure

```
src/
├── webparts/
│   └── correctiveActionForm/
│       ├── components/
│       │   ├── CorrectiveActionFormApp.tsx    # Main app component
│       │   ├── CorrectiveActionForm.tsx       # Form component
│       │   ├── Dashboard.tsx                  # Dashboard/list view
│       │   └── FormFields.tsx                 # Reusable field components
│       ├── models/
│       │   └── ICorrectiveAction.ts          # TypeScript interfaces
│       ├── services/
│       │   └── SharePointService.ts          # Data access layer
│       ├── loc/
│       │   ├── en-us.js                      # Localization strings
│       │   └── mystrings.d.ts                # String type definitions
│       ├── CorrectiveActionFormWebPart.ts    # Web part main file
│       └── CorrectiveActionFormWebPart.manifest.json
```

## Key Components

### SharePointService
Handles all SharePoint data operations using PnPjs:
- Fetching Non Conformities
- CRUD operations for Corrective Actions
- Filtering by current user
- Auto-population logic

### CorrectiveActionForm
Main form component with:
- Auto-population on NC selection
- Form validation
- Conditional rendering
- Save/update functionality

### Dashboard
List view component with:
- User-specific filtering
- Search functionality
- Status indicators
- Click-to-edit

### FormFields
Reusable components:
- Text fields
- Dropdowns
- Date pickers
- Toggles
- Action plan steps
- Cause and effect fields

## Troubleshooting

### Web part doesn't appear
- Ensure the solution is deployed in the App Catalog
- Check that the app is added to your site
- Verify you have permissions to add web parts

### Auto-population not working
- Verify the "Non Conformities" list exists and has data
- Check column names match exactly
- Ensure you have read permissions on the Non Conformities list

### Can't see items in dashboard
- Dashboard only shows items created by you (Created By filter)
- Check that you've created corrective actions
- Verify permissions on the Corrective Actions list

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (must be v16 or v18)
- Clear cache: `gulp clean`

## Browser Support

- Microsoft Edge (Chromium)
- Google Chrome
- Mozilla Firefox
- Safari

## License

Copyright (c) 2025. All rights reserved.

## Support

For issues and questions, please contact your SharePoint administrator.

---

**Built with SharePoint Framework v1.18.2**
