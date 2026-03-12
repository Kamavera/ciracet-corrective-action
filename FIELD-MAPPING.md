# SharePoint List Field Mapping

This document shows how the form fields map to your existing SharePoint list columns.

## Non Conformities List → Corrective Actions Form (Auto-Population)

When a user selects an NC Report Number, these fields are automatically populated:

| SharePoint Column Name | Form Field Label | Auto-Populated |
|------------------------|------------------|----------------|
| `ReferenceID` | NC Report Number | ✅ (User selects from dropdown) |
| `Title` | Title | ✅ Yes |
| `IssueDescription` | Issue Description | ✅ Yes |
| `CauseAndEffectAnalysis1` | Cause and Effect Analysis #1 | ✅ Yes |
| `CauseAndEffectAnalysis2` | Cause and Effect Analysis #2 | ✅ Yes |
| `CauseAndEffectAnalysis3` | Cause and Effect Analysis #3 | ✅ Yes |
| `CauseAndEffectAnalysis4` | Cause and Effect Analysis #4 | ✅ Yes |
| `CauseAndEffectAnalysis5` | Cause and Effect Analysis #5 | ✅ Yes |
| `RootCause` | Root Cause | ✅ Yes |
| `AssignedTo` | Responsible Person | ✅ Yes |
| `TargetResolutionDate` | Due Date | ✅ Yes |

## Corrective Actions List - Complete Field Mapping

### Basic Information

| SharePoint Column | Form Field Label | Type | Notes |
|-------------------|------------------|------|-------|
| `Title` | Title | Text | Required |
| `Status` | Status | Choice | Open, In Progress, Completed, Closed |
| `ReferenceID` | Corrective Action Reference ID | Text | Auto-generated (NC → AC) |
| `NCReportNumber` | NC Report Number | Text | Dropdown from Non Conformities |
| `PlaceOfNC` | Place of NC | Text | |
| `DueDate` | Due Date | Date | |
| `ResponsiblePerson` | Responsible Person | Text | |
| `CompletionDate` | Completion Date | Date | |
| `VerifiedBy` | Verified By | Text | |

### Issue & Root Cause Analysis (Read-Only, Auto-Populated)

| SharePoint Column | Form Field Label | Type | Notes |
|-------------------|------------------|------|-------|
| `IssueDescription` | Issue Description | Multi-line Text | Auto-populated, disabled |
| `CauseAndEffectAnalysis1` | Cause and Effect Analysis #1 | Multi-line Text | Auto-populated, disabled |
| `FollowUpNeededForCause2` | Follow-Up Needed for Cause #2? | Text (YES/NO) | Choice Group |
| `CauseAndEffectAnalysis2` | Cause and Effect Analysis #2 | Multi-line Text | Shows if Follow-Up = YES |
| `FollowUpNeededForCause3` | Follow-Up Needed for Cause #3? | Text (YES/NO) | Choice Group |
| `CauseAndEffectAnalysis3` | Cause and Effect Analysis #3 | Multi-line Text | Shows if Follow-Up = YES |
| `FollowUpNeededForCause4` | Follow-Up Needed for Cause #4? | Text (YES/NO) | Choice Group |
| `CauseAndEffectAnalysis4` | Cause and Effect Analysis #4 | Multi-line Text | Shows if Follow-Up = YES |
| `FollowUpNeededForCause5` | Follow-Up Needed for Cause #5? | Text (YES/NO) | Choice Group |
| `CauseAndEffectAnalysis5` | Cause and Effect Analysis #5 | Multi-line Text | Shows if Follow-Up = YES |
| `RootCause` | Root Cause | Multi-line Text | Auto-populated, disabled |

### Action Plan (User Editable)

| SharePoint Column | Form Field Label | Type | Notes |
|-------------------|------------------|------|-------|
| `ActionPlanStep1` | Action Plan Step #1 | Multi-line Text | Always visible |
| `ActionPlan1Responsible` | Responsible Person (Step 1) | Text | |
| `DueDatePlan1` | Due Date (Step 1) | Date | |
| `FollowUpNeededAction2` | Follow-Up Needed Action #2? | Text (YES/NO) | Choice Group |
| `ActionPlanStep2` | Action Plan Step #2 | Multi-line Text | Shows if Follow-Up = YES |
| `ActionPlan2Responsible` | Responsible Person (Step 2) | Text | |
| `ActionPlan2DueDate` | Due Date (Step 2) | Date | |
| `FollowUpNeededAction3` | Follow-Up Needed Action #3? | Text (YES/NO) | Choice Group |
| `ActionPlanStep3` | Action Plan Step #3 | Multi-line Text | Shows if Follow-Up = YES |
| `ActionPlan3Responsible` | Responsible Person (Step 3) | Text | |
| `ActionPlan3DueDate` | Due Date (Step 3) | Date | |
| `FollowUpNeededAction4` | Follow-Up Needed Action #4? | Text (YES/NO) | Choice Group |
| `ActionPlanStep4` | Action Plan Step #4 | Multi-line Text | Shows if Follow-Up = YES |
| `ActionPlan4Responsible` | Responsible Person (Step 4) | Text | |
| `ActionPlan4DueDate` | Due Date (Step 4) | Date | |
| `FollowUpNeededAction5` | Follow-Up Needed Action #5? | Text (YES/NO) | Choice Group |
| `ActionPlanStep5` | Action Plan Step #5 | Multi-line Text | Shows if Follow-Up = YES |
| `ActionPlan5Responsible` | Responsible Person (Step 5) | Text | |
| `ActionPlan5DueDate` | Due Date (Step 5) | Date | |

### Verification & Audit

| SharePoint Column | Form Field Label | Type | Notes |
|-------------------|------------------|------|-------|
| `ActionEffectivenessVerification` | Action Effectiveness Verification | Multi-line Text | |
| `ActionEffectivenessVerificationDate` | Action Effectiveness Verification Date | Date | |
| `QAAuditor` | QA Auditor | Text | |
| `Comments` | Comments | Multi-line Text | |

### Additional Information

| SharePoint Column | Form Field Label | Type | Notes |
|-------------------|------------------|------|-------|
| `CCList` | CC List | Text | Semicolon-separated emails |
| `CAPAStatus` | CAPA Status | Choice | Open, In Progress, Completed, Closed |
| `IsRiskAlreadyIdentified` | Is Risk Already Identified? | Text (YES/NO) | Choice Group |
| `UpdateRiskAnalysisMatrix` | Update Risk Analysis Matrix | Multi-line Text | |

## Reference ID Generation Logic

When a user selects an NC Report Number, the Corrective Action Reference ID is automatically generated:

- **Input:** `NC 2024-03`  → **Output:** `AC 2024-03`
- **Input:** `NC-2025-07` → **Output:** `AC-2025-07`

The logic replaces "NC" with "AC" while preserving the format (space or dash).

## Conditional Field Display

The form uses conditional logic to show/hide fields based on user selections:

### Cause and Effect Analysis
- Analysis #1 is always shown (auto-populated)
- Analysis #2-5 only appear if the corresponding "Follow-Up Needed" is set to "YES"

### Action Plan Steps
- Step #1 is always shown (user must fill in)
- Steps #2-5 only appear if the corresponding "Follow-Up Needed Action" is set to "YES"

## Dashboard Columns

The dashboard displays these columns:

1. **Title** (clickable to edit)
2. **Status** (color-coded badge)
3. **Reference ID** (Corrective Action ID)
4. **NC Report Number**
5. **Responsible Person**
6. **Due Date** (highlighted in red if overdue)
7. **CAPA Status**

## Notes

- All date fields use the standard SharePoint date format
- Text fields marked as "disabled" cannot be edited by users (auto-populated from NC)
- The form automatically filters Corrective Actions to show only items created by the current user
- Search functionality works across Title, Status, Reference ID, and NC Report Number fields
