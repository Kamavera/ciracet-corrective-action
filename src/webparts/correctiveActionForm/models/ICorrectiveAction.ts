// ─── Lifecycle States ────────────────────────────────────────────────────────

/** NC lifecycle: Abierta → En análisis → En ejecución → Cerrada */
export type NCStatus = 'Abierta' | 'En análisis' | 'En ejecución' | 'Cerrada';

/** CA status aligned with NC lifecycle */
export type CAPAStatusValue = 'Abierta' | 'En proceso' | 'Cerrada';

/** Valid next states for each NC status (lifecycle enforcement — Phase 6) */
export const NC_VALID_TRANSITIONS: Record<NCStatus, NCStatus[]> = {
  'Abierta':       ['En análisis'],
  'En análisis':   ['En ejecución'],
  'En ejecución':  ['Cerrada'],
  'Cerrada':       []
};

// ─── Catalog Constants ────────────────────────────────────────────────────────

export interface IDropdownOption {
  key: string | number;
  text: string;
}

export const NCStatusOptions: IDropdownOption[] = [
  { key: 'Abierta',       text: 'Abierta' },
  { key: 'En análisis',   text: 'En análisis' },
  { key: 'En ejecución',  text: 'En ejecución' },
  { key: 'Cerrada',       text: 'Cerrada' }
];

export const CAPAStatusOptions: IDropdownOption[] = [
  { key: 'Abierta',    text: 'Abierta' },
  { key: 'En proceso', text: 'En proceso' },
  { key: 'Cerrada',    text: 'Cerrada' }
];

export const SeverityOptions: IDropdownOption[] = [
  { key: 'Baja',     text: 'Baja' },
  { key: 'Media',    text: 'Media' },
  { key: 'Alta',     text: 'Alta' },
  { key: 'Crítica',  text: 'Crítica' }
];

export const NCTypeOptions: IDropdownOption[] = [
  { key: 'Interna',         text: 'Interna' },
  { key: 'Externa',         text: 'Externa' },
  { key: 'De auditoría',    text: 'De auditoría' },
  { key: 'De proceso',      text: 'De proceso' },
  { key: 'De producto',     text: 'De producto' }
];

export const AreaOptions: IDropdownOption[] = [
  { key: 'Calidad',         text: 'Calidad' },
  { key: 'Producción',      text: 'Producción' },
  { key: 'Logística',       text: 'Logística' },
  { key: 'Compras',         text: 'Compras' },
  { key: 'Recursos Humanos',text: 'Recursos Humanos' },
  { key: 'Tecnología',      text: 'Tecnología' },
  { key: 'Administración',  text: 'Administración' },
  { key: 'Otro',            text: 'Otro' }
];

export const ProcessOptions: IDropdownOption[] = [
  { key: 'Gestión de Calidad',        text: 'Gestión de Calidad' },
  { key: 'Gestión de Proveedores',    text: 'Gestión de Proveedores' },
  { key: 'Control de Documentos',     text: 'Control de Documentos' },
  { key: 'Auditoría Interna',         text: 'Auditoría Interna' },
  { key: 'Mejora Continua',           text: 'Mejora Continua' },
  { key: 'Satisfacción del Cliente',  text: 'Satisfacción del Cliente' },
  { key: 'Otro',                      text: 'Otro' }
];

// ─── Non Conformity ───────────────────────────────────────────────────────────

export interface INonConformity {
  Id?: number;
  Title: string;
  /** Auto-generated: "NC-XXXXXX" */
  ReferenceID: string;
  /** Classification */
  NCType: string;
  Area: string;
  Process: string;
  Severity: string;
  /** Free-text description of the detected issue */
  IssueDescription: string;
  PlaceOfNC: string;
  /** SharePoint user ID string */
  ReportedBy: string;
  ReportedDate: Date | null;
  /** Primary responsible person — SharePoint user ID string */
  AssignedTo: string;
  TargetResolutionDate: Date | null;
  ClosureDate: Date | null;
  VerificationResult: string;
  Status: NCStatus;
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
