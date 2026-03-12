# Form Flow & User Experience

This document explains how the form works from the user's perspective.

---

## 📊 Dashboard View

When users first open the web part, they see:

```
┌─────────────────────────────────────────────────────────────┐
│  My Corrective Actions                                      │
├─────────────────────────────────────────────────────────────┤
│  [+ New Corrective Action]  [🔄 Refresh]                   │
│                                                              │
│  🔍 Search: [________________]                              │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Title  │ Status │ Ref ID  │ NC #    │ Due Date    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Item 1 │ Open   │ AC 2024 │ NC 2024 │ 10/15/2024  │   │
│  │ Item 2 │ In Prg │ AC 2025 │ NC 2025 │ 11/20/2024  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Showing 2 of 2 items                                       │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Only shows items created by current user
- Click title to edit
- Search filters in real-time
- Color-coded status badges

---

## 🆕 Creating New Corrective Action

### Step 1: Basic Information

User clicks "New Corrective Action" and sees:

```
┌─────────────────────────────────────────────────────────────┐
│  New Corrective Action                                      │
├─────────────────────────────────────────────────────────────┤
│  Basic Information                                          │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Title: *                [________________]                 │
│  Status: *               [Open ▼]                           │
│                                                              │
│  NC Report Number: *     [Select NC... ▼]                   │
│                          ├─ NC 2024-03 - Work Orders        │
│                          ├─ NC 2024-05 - Ventas Piezas      │
│                          └─ NC 2025-01 - Analisis Riesgos   │
│                                                              │
│  Corrective Action ID:   [AC 2024-03] (auto-generated)     │
│                                                              │
│  Place of NC:            [________________]                 │
│  Responsible Person:     [________________]                 │
│                                                              │
│  Due Date:               [📅 10/15/2024]                    │
│  Completion Date:        [📅 __/__/____]                    │
│                                                              │
│  Verified By:            [________________]                 │
└─────────────────────────────────────────────────────────────┘
```

### Step 2: Auto-Population ✨

When user selects "NC 2024-03 - Work Orders":

```
🔄 Loading... Auto-populating data from Non Conformity

✅ Data auto-populated from Non Conformity

┌─────────────────────────────────────────────────────────────┐
│  Title: *                [Work Orders Abiertos] ✅          │
│  Corrective Action ID:   [AC 2024-03] ✅                    │
│  Responsible Person:     [Yomara Santiago] ✅               │
│  Due Date:               [📅 03/31/2025] ✅                 │
└─────────────────────────────────────────────────────────────┘
```

### Step 3: Issue Description & Analysis (Read-Only)

```
┌─────────────────────────────────────────────────────────────┐
│  Issue Description & Root Cause Analysis                    │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Issue Description: (auto-filled, cannot edit)              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ En el sistema CAMS existen muchos work orders         │ │
│  │ abiertos con más de 60 dias...                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Cause and Effect Analysis #1: (auto-filled)               │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Biomedico y/o personal documentan fuera de fecha...   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Follow-Up Needed for Cause #2?  ⚪ YES  ⚫ NO             │
│                                                              │
│  (If YES selected, Cause #2 field appears below)           │
│                                                              │
│  Root Cause: (auto-filled)                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Personal debe sacar tiempo para dedicar al            │ │
│  │ seguimiento a los trabajos abiertos.                   │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Conditional Logic:**
- Cause #2-5 only appear if user selects "YES" for follow-up

### Step 4: Action Plan (User Fills In)

```
┌─────────────────────────────────────────────────────────────┐
│  Action Plan                                                │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Action Plan Step #1                                        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Step 1 Description:                                    │ │
│  │ [Seguimiento a personal tecnico para actualizacion]   │ │
│  │                                                         │ │
│  │ Responsible Person:  [Eileen Pérez]                   │ │
│  │ Due Date:            [📅 05/30/2025]                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Follow-Up Needed Action #2?  ⚫ YES  ⚪ NO                 │
│                                                              │
│  (If YES, Action Plan Step #2 appears)                     │
│                                                              │
│  Action Plan Step #2                                        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Step 2 Description:                                    │ │
│  │ [Repasar procesos de documentacion en CAMS...]        │ │
│  │                                                         │ │
│  │ Responsible Person:  [Yomara Santiago]                │ │
│  │ Due Date:            [📅 01/30/2025]                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Follow-Up Needed Action #3?  ⚫ YES  ⚪ NO                 │
│                                                              │
│  (Pattern continues for steps #3, #4, #5)                  │
└─────────────────────────────────────────────────────────────┘
```

**Conditional Logic:**
- Step #1 is always visible
- Steps #2-5 appear based on "Follow-Up Needed" selections

### Step 5: Verification & Additional Info

```
┌─────────────────────────────────────────────────────────────┐
│  Verification & Audit                                       │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  Action Effectiveness Verification:                         │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [Enter verification details...]                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  Verification Date:  [📅 __/__/____]                        │
│  QA Auditor:        [Eng. Noris Torres]                    │
│                                                              │
│  Comments:                                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [Additional comments...]                               │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│  Additional Information                                     │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  CC List:           [email1@domain.com; email2@domain.com] │
│  CAPA Status:       [Open ▼]                               │
│                                                              │
│  Is Risk Already Identified?  ⚪ YES  ⚫ NO                 │
│                                                              │
│  Update Risk Analysis Matrix:                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [Risk matrix updates...]                               │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│                                    [Cancel]  [Submit]       │
└─────────────────────────────────────────────────────────────┘
```

### Step 6: Confirmation & Save

When user clicks "Submit":

```
┌─────────────────────────────────────────┐
│  Confirm Submission                     │
├─────────────────────────────────────────┤
│                                          │
│  Are you sure you want to create        │
│  this Corrective Action?                │
│                                          │
│               [Yes]  [No]               │
└─────────────────────────────────────────┘
```

After clicking "Yes":

```
⏳ Saving...

✅ Corrective Action created successfully!

(Redirects to Dashboard after 1.5 seconds)
```

---

## ✏️ Editing Existing Corrective Action

User clicks on a title in the dashboard:

```
┌─────────────────────────────────────────────────────────────┐
│  Edit Corrective Action                                     │
├─────────────────────────────────────────────────────────────┤
│  (Same form as "New", but pre-filled with existing data)   │
│                                                              │
│  NC Report Number is DISABLED (cannot change)               │
│  All other fields can be updated                            │
│                                                              │
│                                    [Cancel]  [Update]       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual Indicators

### Status Color Coding
- 🔴 **Open** - Red (#d13438)
- 🟡 **In Progress** - Orange (#ffaa44)
- 🟢 **Completed** - Green (#107c10)
- 🔵 **Closed** - Blue (#0078d4)

### Due Date Highlighting
- ⚠️ **Overdue** - Red text, bold
- ✅ **On Time** - Normal text

### Loading States
- 🔄 Spinner with "Loading..." message
- 💾 Spinner with "Saving..." message

### Error Messages
- ❌ Red message bar at top of form
- Clear, actionable error text

### Success Messages
- ✅ Green message bar at top of form
- Auto-dismisses after showing

---

## 🔐 Security & Filtering

### Dashboard Filtering
```sql
-- Behind the scenes filter
SELECT * FROM CorrectiveActions
WHERE Author/Id = CurrentUser.Id
ORDER BY Modified DESC
```

Users **ONLY** see their own items. No access to others' corrective actions.

---

## 📱 Responsive Design

### Desktop (> 1200px)
- Full two-column layout
- All fields side-by-side where appropriate
- Wide action plan steps

### Tablet (768px - 1200px)
- Single column for most sections
- Stacked form fields
- Readable spacing

### Mobile (< 768px)
- Full single column
- Touch-friendly buttons
- Optimized field sizes

---

## 🚀 Performance

### Auto-Population Speed
1. User selects NC → **Instant UI update**
2. Fetch from SharePoint → **~500ms**
3. Populate fields → **Instant**
4. Show success message → **Animated**

### Save Operation
1. Validate form → **Instant**
2. Show confirmation → **User action**
3. Save to SharePoint → **~1-2 seconds**
4. Redirect to dashboard → **After 1.5s**

---

## 🎯 User Journey Summary

```
Dashboard → Click "New" → Select NC → Auto-Fill ✨
  ↓
Fill Action Plans → Add Verification → Submit
  ↓
Confirmation → Save → Success! → Back to Dashboard
  ↓
Item appears in list → Click to Edit → Update → Save
```

---

## 💡 Key UX Features

✅ **Minimal typing** - Most fields auto-populate
✅ **Smart defaults** - Status = "Open", CAPA = "Open"
✅ **Conditional fields** - Only show what's needed
✅ **Inline validation** - Errors shown immediately
✅ **Loading feedback** - Spinners for async operations
✅ **Confirmation dialogs** - Prevent accidental actions
✅ **Success notifications** - Clear feedback on saves
✅ **Keyboard friendly** - Tab navigation works perfectly
✅ **Mobile optimized** - Works on phones/tablets

---

This is the complete user experience your team will get! 🎉
