// ─── Lifecycle States ────────────────────────────────────────────────────────

/**
 * NC lifecycle — keys must match the actual SharePoint "Status" Choice field values.
 * SP values: 'Not Started' | 'In progress' | 'Completed' | 'Overdue'
 */
export type NCStatus = 'Not Started' | 'In progress' | 'Completed' | 'Overdue';

/**
 * CA CAPA status — keys must match the actual SharePoint "CAPAStatus" Choice field values.
 * SP values: 'Open' | 'In Process' | 'Closed'
 */
export type CAPAStatusValue = 'Open' | 'In Process' | 'Closed';

/** Valid next states for each NC status (lifecycle enforcement — Phase 6) */
export const NC_VALID_TRANSITIONS: Record<NCStatus, NCStatus[]> = {
  'Not Started': ['In progress'],
  'In progress': ['Completed'],
  'Completed':   [],
  'Overdue':     ['In progress']
};

// ─── Catalog Constants ────────────────────────────────────────────────────────

export interface IDropdownOption {
  key: string | number;
  text: string;
}

/** NC Status options — keys are real SP choice values, text is Spanish UI label */
export const NCStatusOptions: IDropdownOption[] = [
  { key: 'Not Started', text: 'No iniciada' },
  { key: 'In progress', text: 'En progreso' },
  { key: 'Completed',   text: 'Completada' },
  { key: 'Overdue',     text: 'Vencida' }
];

/** CAPA Status options — keys are real SP choice values, text is Spanish UI label */
export const CAPAStatusOptions: IDropdownOption[] = [
  { key: 'Open',       text: 'Abierta' },
  { key: 'In Process', text: 'En proceso' },
  { key: 'Closed',     text: 'Cerrada' }
];

/** Severity options — keys match SP "SeverityofNC" Choice field values */
export const SeverityOptions: IDropdownOption[] = [
  { key: 'Critical', text: 'Crítica' },
  { key: 'Major',    text: 'Mayor' },
  { key: 'Minor',    text: 'Menor' }
];

/** NC Type options — keys match SP "TypeofAction" Choice field values */
export const NCTypeOptions: IDropdownOption[] = [
  { key: 'Internal Audit',     text: 'Auditoría Interna' },
  { key: 'Customer Complaint', text: 'Queja de Cliente' },
  { key: 'Process',            text: 'Proceso' },
  { key: 'Documentation',      text: 'Documentación' }
];

// ─── Non Conformity ───────────────────────────────────────────────────────────

export interface INonConformity {
  Id?: number;
  Title: string;
  /** Auto-generated: "NC-XXXXXX" */
  ReferenceID: string;
  /** Classification — stored in SP field "TypeofAction" */
  NCType: string;
  /** UI-only — does not exist as a column in the NC SharePoint list */
  Area?: string;
  /** UI-only — does not exist as a column in the NC SharePoint list */
  Process?: string;
  Severity: string;
  /** Free-text description of the detected issue — stored in SP field "Description" */
  IssueDescription: string;
  /** UI-only — does not exist as a column in the NC SharePoint list */
  PlaceOfNC?: string;
  /** SharePoint user ID string — stored in SP UserMulti field "ReportedBy0" */
  ReportedBy: string;
  /** Stored in the SP DateTime field whose internal name is "ReportedBy" */
  ReportedDate: Date | null;
  /** Primary responsible person — SharePoint user ID string */
  AssignedTo: string;
  TargetResolutionDate: Date | null;
  /** Stored in SP field "ResolutionDateExtension" */
  ClosureDate: Date | null;
  /** Stored in SP field "ActionEffectivenessVerification" */
  VerificationResult: string;
  /** SP "Status" Choice field — values: 'Not Started' | 'In progress' | 'Completed' | 'Overdue' */
  Status: NCStatus;
  /** Stored in SP field "ResolutionTargetDateExtensionReq" */
  Comments: string;
  // Cause & Effect (populated from corrective action analysis)
  CauseAndEffectAnalysis1: string;
  CauseAndEffectAnalysis2: string;
  CauseAndEffectAnalysis3: string;
  CauseAndEffectAnalysis4: string;
  CauseAndEffectAnalysis5: string;
  RootCause: string;
}

// ─── Corrective Action ────────────────────────────────────────────────────────

export interface ICorrectiveAction {
  Id?: number;
  Title: string;
  /** CA Reference ID — auto-derived from NC (e.g. "NC-000001" → "AC-000001") */
  ReferenceID: string;
  /** NC Reference ID lookup */
  NCReportNumber: string;
  Status: string;
  PlaceOfNC: string;
  DueDate: Date | null;
  /** SharePoint user ID|loginName string */
  ResponsiblePerson: string;
  IssueDescription: string;

  // Cause and Effect Analysis (up to 5 levels, conditional)
  CauseAndEffectAnalysis1: string;
  FollowUpNeededForCause2: string;
  CauseAndEffectAnalysis2: string;
  FollowUpNeededForCause3: string;
  CauseAndEffectAnalysis3: string;
  FollowUpNeededForCause4: string;
  CauseAndEffectAnalysis4: string;
  FollowUpNeededForCause5: string;
  CauseAndEffectAnalysis5: string;

  RootCause: string;
  CompletionDate: Date | null;
  /** SharePoint user ID|loginName string */
  VerifiedBy: string;

  // Action Plan Steps (up to 5 levels, conditional)
  ActionPlanStep1: string;
  ActionPlan1Responsible: string;
  DueDatePlan1: Date | null;

  FollowUpNeededAction2: string;
  ActionPlanStep2: string;
  ActionPlan2Responsible: string;
  ActionPlan2DueDate: Date | null;

  FollowUpNeededAction3: string;
  ActionPlanStep3: string;
  ActionPlan3Responsible: string;
  ActionPlan3DueDate: Date | null;

  FollowUpNeededAction4: string;
  ActionPlanStep4: string;
  ActionPlan4Responsible: string;
  ActionPlan4DueDate: Date | null;

  FollowUpNeededAction5: string;
  ActionPlanStep5: string;
  ActionPlan5Responsible: string;
  ActionPlan5DueDate: Date | null;

  // Verification and Audit
  ActionEffectivenessVerification: string;
  ActionEffectivenessVerificationDate: Date | null;
  /** SharePoint user ID|loginName string */
  QAAuditor: string;
  Comments: string;

  // Additional
  /** Semicolon-separated "id|loginName" pairs */
  CCList: string;
  CAPAStatus: string;
  IsRiskAlreadyIdentified: string;
  UpdateRiskAnalysisMatrix: string;
}

// ─── History / Audit Trail ────────────────────────────────────────────────────

export interface IHistoryItem {
  Id?: number;
  /** SharePoint ID of the related NC */
  NCId: number;
  /** Human-readable description of what changed (e.g. "Estado cambiado: Abierta → En análisis") */
  Change: string;
  /** Display name of the user who made the change */
  User: string;
  Date: Date | null;
  Comments: string;
}

// ─── Attachment ───────────────────────────────────────────────────────────────

export interface IAttachment {
  FileName: string;
  ServerRelativeUrl: string;
}
