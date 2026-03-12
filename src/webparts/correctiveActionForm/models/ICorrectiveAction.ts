export interface ICorrectiveAction {
  Id?: number;
  Title: string;
  Status: string;
  ReferenceID: string; // Corrective Action Reference ID
  NCReportNumber: string; // NC Report Number
  PlaceOfNC: string;
  DueDate: Date | null;
  ResponsiblePerson: string;
  IssueDescription: string;

  // Cause and Effect Analysis with Follow-Up flags
  CauseAndEffectAnalysis1: string;
  FollowUpNeededForCause2: string; // YES/NO
  CauseAndEffectAnalysis2: string;
  FollowUpNeededForCause3: string; // YES/NO
  CauseAndEffectAnalysis3: string;
  FollowUpNeededForCause4: string; // YES/NO
  CauseAndEffectAnalysis4: string;
  FollowUpNeededForCause5: string; // YES/NO
  CauseAndEffectAnalysis5: string;

  RootCause: string;
  CompletionDate: Date | null;
  VerifiedBy: string;

  // Action Plan Steps with Follow-Up flags
  ActionPlanStep1: string;
  ActionPlan1Responsible: string;
  DueDatePlan1: Date | null;

  FollowUpNeededAction2: string; // YES/NO
  ActionPlanStep2: string;
  ActionPlan2Responsible: string;
  ActionPlan2DueDate: Date | null;

  FollowUpNeededAction3: string; // YES/NO
  ActionPlanStep3: string;
  ActionPlan3Responsible: string;
  ActionPlan3DueDate: Date | null;

  FollowUpNeededAction4: string; // YES/NO
  ActionPlanStep4: string;
  ActionPlan4Responsible: string;
  ActionPlan4DueDate: Date | null;

  FollowUpNeededAction5: string; // YES/NO
  ActionPlanStep5: string;
  ActionPlan5Responsible: string;
  ActionPlan5DueDate: Date | null;

  // Verification and Audit
  ActionEffectivenessVerification: string;
  ActionEffectivenessVerificationDate: Date | null;
  QAAuditor: string;
  Comments: string;

  // Additional Fields
  CCList: string;
  CAPAStatus: string;
  IsRiskAlreadyIdentified: string; // YES/NO
  UpdateRiskAnalysisMatrix: string;
}

export interface INonConformity {
  Id: number;
  Title: string;
  ReferenceID: string; // "Reference ID (Report number)" column
  ReportedBy: string;
  ReportedDate: Date;
  IssueDescription: string;
  PlaceOfNC: string;
  CauseAndEffectAnalysis1: string;
  CauseAndEffectAnalysis2: string;
  CauseAndEffectAnalysis3: string;
  CauseAndEffectAnalysis4: string;
  CauseAndEffectAnalysis5: string;
  RootCause: string;
  SeverityOfNC: string;
  AssignedTo: string;
  TargetResolutionDate: Date;
  Status: string;
}

export interface IDropdownOption {
  key: string | number;
  text: string;
}

export const StatusOptions: IDropdownOption[] = [
  { key: 'Not Started', text: 'Not Started' },
  { key: 'In Progress', text: 'In Progress' },
  { key: 'Completed', text: 'Completed' },
  { key: 'Overdue', text: 'Overdue' }
];

export const CAPAStatusOptions: IDropdownOption[] = [
  { key: 'Open', text: 'Open' },
  { key: 'In Process', text: 'In Process' },
  { key: 'Closed', text: 'Closed' }
];
