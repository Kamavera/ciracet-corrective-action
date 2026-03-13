import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI, spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/items/get-all';
import '@pnp/sp/site-users/web';
import '@pnp/sp/attachments';
import {
  ICorrectiveAction,
  INonConformity,
  IHistoryItem,
  IAttachment,
  IDropdownOption
} from '../models/ICorrectiveAction';

// SharePoint list names
const LIST_CA       = 'Corrective Actions';
const LIST_NC       = 'Non Conformities';
const LIST_HISTORY  = 'Historial';

export class SharePointService {
  private sp: SPFI;
  private context: WebPartContext;

  constructor(context: WebPartContext) {
    this.context = context;
    this.sp = spfi().using(SPFx(context));
  }

  // ─── Non Conformities ────────────────────────────────────────────────────────

  /**
   * Returns all NCs as dropdown options (key = ReferenceID, text = "NC-XXX - Title").
   */
  public async getNonConformities(): Promise<IDropdownOption[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle(LIST_NC)
        .items
        .select('Id', 'Title', 'ReferenceID')
        .orderBy('Created', false)
        .top(200)();

      return items.map(item => ({
        key: item.ReferenceID || String(item.Id),
        text: `${item.ReferenceID} - ${item.Title}`
      }));
    } catch (error) {
      console.error('Error fetching Non Conformities:', error);
      throw new Error('Failed to load Non Conformities list');
    }
  }

  /**
   * Returns full NC data by its ReferenceID, or null if not found.
   */
  public async getNonConformityByReferenceId(referenceId: string): Promise<INonConformity | null> {
    try {
      const items = await this.sp.web.lists
        .getByTitle(LIST_NC)
        .items
        .filter(`ReferenceID eq '${referenceId}'`)
        .top(1)();

      if (items.length === 0) return null;

      const item = items[0];
      return this.mapToNonConformity(item);
    } catch (error) {
      console.error('Error fetching NC by ReferenceID:', error);
      return null;
    }
  }

  /**
   * Returns a single NC by its SharePoint item ID.
   */
  public async getNonConformityById(id: number): Promise<INonConformity | null> {
    try {
      const item = await this.sp.web.lists
        .getByTitle(LIST_NC)
        .items
        .getById(id)();

      return this.mapToNonConformity(item);
    } catch (error) {
      console.error('Error fetching NC by ID:', error);
      return null;
    }
  }

  /**
   * Returns all NCs (for the dashboard all-items view).
   */
  public async getAllNonConformities(): Promise<INonConformity[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle(LIST_NC)
        .items
        .select(
          'Id', 'Title', 'ReferenceID', 'NCType', 'Area', 'Process',
          'SeverityofNC', 'Status', 'ReportedBy', 'ReportedDate',
          'AssignedtoId', 'TargetResolutionDate', 'ClosureDate'
        )
        .orderBy('Id', false)
        .top(500)();

      return items.map(item => this.mapToNonConformity(item));
    } catch (error) {
      console.error('Error fetching all NCs:', error);
      throw new Error('Failed to load Non Conformities');
    }
  }

  /**
   * Creates a new NC. Returns the new item ID.
   */
  public async createNonConformity(data: INonConformity): Promise<number> {
    try {
      const result = await this.sp.web.lists
        .getByTitle(LIST_NC)
        .items
        .add(this.mapFromNonConformity(data));

      return result.data.Id;
    } catch (error) {
      console.error('Error creating Non Conformity:', error);
      throw new Error('Failed to create Non Conformity');
    }
  }

  /**
   * Updates an existing NC.
   */
  public async updateNonConformity(id: number, data: INonConformity): Promise<void> {
    try {
      await this.sp.web.lists
        .getByTitle(LIST_NC)
        .items
        .getById(id)
        .update(this.mapFromNonConformity(data));
    } catch (error) {
      console.error('Error updating Non Conformity:', error);
      throw new Error('Failed to update Non Conformity');
    }
  }

  // ─── Corrective Actions ───────────────────────────────────────────────────────

  /**
   * Returns CAs belonging to or authored by the current user.
   */
  public async getMyCorrectiveActions(): Promise<ICorrectiveAction[]> {
    try {
      const currentUser = await this.sp.web.currentUser();
      const items = await this.sp.web.lists
        .getByTitle(LIST_CA)
        .items
        .filter(`(Author/Id eq ${currentUser.Id}) or (ResponsiblePerson eq ${currentUser.Id})`)
        .select('*', 'Noconformidades/ReferenceID', 'Noconformidades/Title')
        .expand('Noconformidades')
        .top(200)();

      return items.map(item => this.mapToCorrectiveActionSimple(item));
    } catch (error) {
      console.error('Error fetching my Corrective Actions:', error);
      throw new Error('Failed to load Corrective Actions');
    }
  }

  /**
   * Returns all CAs — for manager/auditor dashboard view.
   */
  public async getAllCorrectiveActions(): Promise<ICorrectiveAction[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle(LIST_CA)
        .items
        .select('*', 'Noconformidades/ReferenceID', 'Noconformidades/Title')
        .expand('Noconformidades')
        .orderBy('Id', false)
        .top(500)();

      return items.map(item => this.mapToCorrectiveActionSimple(item));
    } catch (error) {
      console.error('Error fetching all Corrective Actions:', error);
      throw new Error('Failed to load Corrective Actions');
    }
  }

  /**
   * Returns a single CA by ID with full user hydration (for edit form).
   */
  public async getCorrectiveActionById(id: number): Promise<ICorrectiveAction | null> {
    try {
      const item = await this.sp.web.lists
        .getByTitle(LIST_CA)
        .items
        .getById(id)
        .select('*', 'Noconformidades/ReferenceID', 'Noconformidades/Title')
        .expand('Noconformidades')();

      return this.mapToCorrectiveActionWithUsers(item);
    } catch (error) {
      console.error('Error fetching Corrective Action:', error);
      return null;
    }
  }

  /**
   * Creates a new CA. Returns the new item ID.
   */
  public async createCorrectiveAction(data: ICorrectiveAction): Promise<number> {
    try {
      const result = await this.sp.web.lists
        .getByTitle(LIST_CA)
        .items
        .add(this.mapFromCorrectiveAction(data));

      return result.data.Id;
    } catch (error) {
      console.error('Error creating Corrective Action:', error);
      throw new Error('Failed to create Corrective Action');
    }
  }

  /**
   * Updates an existing CA.
   */
  public async updateCorrectiveAction(id: number, data: ICorrectiveAction): Promise<void> {
    try {
      await this.sp.web.lists
        .getByTitle(LIST_CA)
        .items
        .getById(id)
        .update(this.mapFromCorrectiveAction(data));
    } catch (error) {
      console.error('Error updating Corrective Action:', error);
      throw new Error('Failed to update Corrective Action');
    }
  }

  /**
   * Deletes a CA by ID. Caller must verify admin role before calling.
   */
  public async deleteCorrectiveAction(id: number): Promise<void> {
    try {
      await this.sp.web.lists
        .getByTitle(LIST_CA)
        .items
        .getById(id)
        .delete();
    } catch (error) {
      console.error('Error deleting Corrective Action:', error);
      throw new Error('Failed to delete Corrective Action');
    }
  }

  /**
   * Derives CA Reference ID from NC Reference ID ("NC-000001" → "AC-000001").
   */
  public generateCorrectiveActionReferenceId(ncReferenceId: string): string {
    if (ncReferenceId.startsWith('NC ')) return ncReferenceId.replace('NC ', 'AC ');
    if (ncReferenceId.startsWith('NC-')) return ncReferenceId.replace('NC-', 'AC-');
    return 'AC ' + ncReferenceId;
  }

  // ─── History / Audit Trail ────────────────────────────────────────────────────

  /**
   * Returns all history entries for a given NC ID, newest first.
   */
  public async getHistoryForNC(ncId: number): Promise<IHistoryItem[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle(LIST_HISTORY)
        .items
        .filter(`NCId eq ${ncId}`)
        .select('Id', 'NCId', 'Change', 'User', 'Date', 'Comments')
        .orderBy('Date', false)
        .top(100)();

      return items.map(item => ({
        Id: item.Id,
        NCId: item.NCId || ncId,
        Change: item.Change || '',
        User: item.User || '',
        Date: item.Date ? new Date(item.Date) : null,
        Comments: item.Comments || ''
      }));
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  }

  /**
   * Adds a new history entry to the Historial list.
   */
  public async addHistoryEntry(entry: IHistoryItem): Promise<void> {
    try {
      await this.sp.web.lists
        .getByTitle(LIST_HISTORY)
        .items
        .add({
          NCId: entry.NCId,
          Change: entry.Change,
          User: entry.User,
          Date: entry.Date ? entry.Date.toISOString() : new Date().toISOString(),
          Comments: entry.Comments
        });
    } catch (error) {
      console.error('Error adding history entry:', error);
      // Non-fatal — log but do not rethrow
    }
  }

  // ─── Attachments ──────────────────────────────────────────────────────────────

  /**
   * Uploads a file attachment to a list item.
   * @param listName  Either LIST_CA or LIST_NC
   */
  public async addAttachment(
    listName: string,
    itemId: number,
    fileName: string,
    content: ArrayBuffer
  ): Promise<void> {
    try {
      await this.sp.web.lists
        .getByTitle(listName)
        .items
        .getById(itemId)
        .attachmentFiles
        .add(fileName, content);
    } catch (error) {
      console.error('Error adding attachment:', error);
      throw new Error('Failed to upload attachment');
    }
  }

  /**
   * Returns the list of file attachments for a given list item.
   */
  public async getAttachments(listName: string, itemId: number): Promise<IAttachment[]> {
    try {
      const files = await this.sp.web.lists
        .getByTitle(listName)
        .items
        .getById(itemId)
        .attachmentFiles();

      return files.map(f => ({
        FileName: f.FileName,
        ServerRelativeUrl: f.ServerRelativeUrl
      }));
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  }

  // ─── Private Mapping Helpers ──────────────────────────────────────────────────

  private mapToNonConformity(item: any): INonConformity {
    return {
      Id: item.Id,
      Title: item.Title || '',
      ReferenceID: item.ReferenceID || '',
      NCType: item.NCType || '',
      Area: item.Area || '',
      Process: item.Process || '',
      Severity: item.SeverityofNC || '',
      IssueDescription: item.Description || item.IssueDescription || '',
      PlaceOfNC: item.PlaceofNC || '',
      ReportedBy: item.ReportedBy || '',
      ReportedDate: item.ReportedDate ? new Date(item.ReportedDate) : null,
      AssignedTo: item.AssignedtoId ? String(item.AssignedtoId) : '',
      TargetResolutionDate: item.TargetResolutionDate ? new Date(item.TargetResolutionDate) : null,
      ClosureDate: item.ClosureDate ? new Date(item.ClosureDate) : null,
      VerificationResult: item.VerificationResult || '',
      Status: item.Status || 'Abierta',
      Comments: item.Comments || '',
      CauseAndEffectAnalysis1: item['CauseandEffectAnalysis_x0023_1'] || '',
      CauseAndEffectAnalysis2: item['CauseandEffectAnalysis_x0023_2'] || '',
      CauseAndEffectAnalysis3: item['CauseandEffectAnalysis_x0023_3'] || '',
      CauseAndEffectAnalysis4: item['CauseandEffectAnalysis_x0023_4'] || '',
      CauseAndEffectAnalysis5: item['CauseandEffectAnalysis_x0023_5'] || '',
      RootCause: item.RootCause || ''
    };
  }

  private mapFromNonConformity(data: INonConformity): any {
    return {
      Title: data.Title,
      ReferenceID: data.ReferenceID,
      NCType: data.NCType,
      Area: data.Area,
      Process: data.Process,
      SeverityofNC: data.Severity,
      Description: data.IssueDescription,
      PlaceofNC: data.PlaceOfNC,
      ReportedBy: data.ReportedBy,
      ReportedDate: data.ReportedDate ? data.ReportedDate.toISOString() : null,
      AssignedtoId: data.AssignedTo ? parseInt(data.AssignedTo.includes('|') ? data.AssignedTo.split('|')[0] : data.AssignedTo) : null,
      TargetResolutionDate: data.TargetResolutionDate ? data.TargetResolutionDate.toISOString() : null,
      ClosureDate: data.ClosureDate ? data.ClosureDate.toISOString() : null,
      VerificationResult: data.VerificationResult,
      Status: data.Status,
      Comments: data.Comments,
      'CauseandEffectAnalysis_x0023_1': data.CauseAndEffectAnalysis1,
      'CauseandEffectAnalysis_x0023_2': data.CauseAndEffectAnalysis2,
      'CauseandEffectAnalysis_x0023_3': data.CauseAndEffectAnalysis3,
      'CauseandEffectAnalysis_x0023_4': data.CauseAndEffectAnalysis4,
      'CauseandEffectAnalysis_x0023_5': data.CauseAndEffectAnalysis5,
      RootCause: data.RootCause
    };
  }

  private mapToCorrectiveActionSimple(item: any): ICorrectiveAction {
    return {
      Id: item.Id,
      Title: item.Title || '',
      Status: item.Status || 'Abierta',
      ReferenceID: item.ReferenceID || '',
      NCReportNumber: item.Noconformidades ? item.Noconformidades.ReferenceID || '' : '',
      PlaceOfNC: item.PlaceofNC || '',
      DueDate: item.DueDate ? new Date(item.DueDate) : null,
      ResponsiblePerson: item.ResponsiblePersonId ? String(item.ResponsiblePersonId) : '',
      IssueDescription: item.CorrectiveActionDescription || '',

      CauseAndEffectAnalysis1: item.RootCause || '',
      FollowUpNeededForCause2: item['Follow_x002d_UpNeeded'] || '',
      CauseAndEffectAnalysis2: item['CauseandEffectAnalysis_x0023_2'] || '',
      FollowUpNeededForCause3: item['Follow_x002d_UpNeededforCause_x0'] || '',
      CauseAndEffectAnalysis3: item['CauseandEffectAnalysis_x0023_3'] || '',
      FollowUpNeededForCause4: item['Follow_x002d_UpNeededforCause_x00'] || '',
      CauseAndEffectAnalysis4: item['CauseandEffectAnalysis_x0023_4'] || '',
      FollowUpNeededForCause5: item['Follow_x002d_UpNeededforCause_x01'] || '',
      CauseAndEffectAnalysis5: item['CauseandEffectAnalysis_x0023_5'] || '',

      RootCause: item.RootCause0 || '',
      CompletionDate: item.CompletionDate ? new Date(item.CompletionDate) : null,
      VerifiedBy: item.VerifiedById ? String(item.VerifiedById) : '',

      ActionPlanStep1: item['ActionPlanStep_x0023_1'] || '',
      ActionPlan1Responsible: item['ActionPlan_x0023_1ResponsibleId'] ? String(item['ActionPlan_x0023_1ResponsibleId']) : '',
      DueDatePlan1: item['DueDatePlan_x0023_1'] ? new Date(item['DueDatePlan_x0023_1']) : null,

      FollowUpNeededAction2: item['Follow_x002d_UpActionNeeded'] || '',
      ActionPlanStep2: item['ActionPlanStep_x0023_2'] || '',
      ActionPlan2Responsible: item['ActionPlanStep_x0023_2ResponsiblId'] ? String(item['ActionPlanStep_x0023_2ResponsiblId']) : '',
      ActionPlan2DueDate: item['ActionPlan_x0023_2DueDate'] ? new Date(item['ActionPlan_x0023_2DueDate']) : null,

      FollowUpNeededAction3: item['Follow_x002d_UpNeededAction_x002'] || '',
      ActionPlanStep3: item['ActionPlanStep_x0023_3'] || '',
      ActionPlan3Responsible: item['ActionPlan_x0023_3ResponsibleId'] ? String(item['ActionPlan_x0023_3ResponsibleId']) : '',
      ActionPlan3DueDate: item['ActionPlan_x0023_3DueDate'] ? new Date(item['ActionPlan_x0023_3DueDate']) : null,

      FollowUpNeededAction4: item['Follow_x002d_UpNeededAction_x0020'] || '',
      ActionPlanStep4: item['ActionPlanStep_x0023_4'] || '',
      ActionPlan4Responsible: item['ActionPlan_x0023_4ResponsibleId'] ? String(item['ActionPlan_x0023_4ResponsibleId']) : '',
      ActionPlan4DueDate: item['ActionPlan_x0023_4DueDate'] ? new Date(item['ActionPlan_x0023_4DueDate']) : null,

      FollowUpNeededAction5: item['Follow_x002d_UpNeededAction_x0021'] || '',
      ActionPlanStep5: item['ActionPlanStep_x0023_5'] || '',
      ActionPlan5Responsible: item['ActionPlan_x0023_5ResponsibleId'] ? String(item['ActionPlan_x0023_5ResponsibleId']) : '',
      ActionPlan5DueDate: item['ActionPlan_x0023_5DueDate'] ? new Date(item['ActionPlan_x0023_5DueDate']) : null,

      ActionEffectivenessVerification: item.ActionEffectivenessVerification || '',
      ActionEffectivenessVerificationDate: item.ActionEffectivenessVerificationD ? new Date(item.ActionEffectivenessVerificationD) : null,
      QAAuditor: item.QAAuditorId ? String(item.QAAuditorId) : '',
      Comments: item.Comments || '',
      CCList: item.CCListId && item.CCListId.results ? item.CCListId.results.join(';') : '',
      CAPAStatus: item.CAPAStatus || 'Abierta',
      IsRiskAlreadyIdentified: item['IsRiskAlreadyIdentified_x003f_'] || '',
      UpdateRiskAnalysisMatrix: item['UpdateRiskAnalysisMatrix_x003f_'] || ''
    };
  }

  private async getUserLoginNameById(userId: number): Promise<string> {
    try {
      const user = await this.sp.web.siteUsers.getById(userId)();
      return user.LoginName || '';
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return '';
    }
  }

  private async mapToCorrectiveActionWithUsers(item: any): Promise<ICorrectiveAction> {
    const userIds = [
      item.ResponsiblePersonId,
      item.VerifiedById,
      item['ActionPlan_x0023_1ResponsibleId'],
      item['ActionPlanStep_x0023_2ResponsiblId'],
      item['ActionPlan_x0023_3ResponsibleId'],
      item['ActionPlan_x0023_4ResponsibleId'],
      item['ActionPlan_x0023_5ResponsibleId'],
      item.QAAuditorId
    ].filter(id => id);

    const loginNames = await Promise.all(userIds.map(id => this.getUserLoginNameById(id)));

    const userMap = new Map<number, string>();
    userIds.forEach((id, index) => {
      if (id && loginNames[index]) userMap.set(id, loginNames[index]);
    });

    let ccListValue = '';
    if (item.CCListId && item.CCListId.results && item.CCListId.results.length > 0) {
      const ccLogins = await Promise.all(item.CCListId.results.map((id: number) => this.getUserLoginNameById(id)));
      ccListValue = item.CCListId.results
        .map((id: number, i: number) => ccLogins[i] ? `${id}|${ccLogins[i]}` : '')
        .filter((v: string) => v)
        .join(';');
    }

    const simple = this.mapToCorrectiveActionSimple(item);
    const resolve = (idVal: number | undefined): string =>
      idVal && userMap.has(idVal) ? `${idVal}|${userMap.get(idVal)}` : '';

    return {
      ...simple,
      ResponsiblePerson: resolve(item.ResponsiblePersonId),
      VerifiedBy:         resolve(item.VerifiedById),
      ActionPlan1Responsible: resolve(item['ActionPlan_x0023_1ResponsibleId']),
      ActionPlan2Responsible: resolve(item['ActionPlanStep_x0023_2ResponsiblId']),
      ActionPlan3Responsible: resolve(item['ActionPlan_x0023_3ResponsibleId']),
      ActionPlan4Responsible: resolve(item['ActionPlan_x0023_4ResponsibleId']),
      ActionPlan5Responsible: resolve(item['ActionPlan_x0023_5ResponsibleId']),
      QAAuditor:          resolve(item.QAAuditorId),
      CCList:             ccListValue
    };
  }

  private mapFromCorrectiveAction(data: ICorrectiveAction): any {
    const parseUser = (val: string): number | null =>
      val ? parseInt(val.includes('|') ? val.split('|')[0] : val) : null;

    return {
      Title: data.Title,
      Status: data.Status,
      ReferenceID: data.ReferenceID,
      PlaceofNC: data.PlaceOfNC,
      DueDate: data.DueDate,
      ResponsiblePersonId: parseUser(data.ResponsiblePerson),
      CorrectiveActionDescription: data.IssueDescription,

      RootCause: data.CauseAndEffectAnalysis1,
      'Follow_x002d_UpNeeded': data.FollowUpNeededForCause2,
      'CauseandEffectAnalysis_x0023_2': data.CauseAndEffectAnalysis2,
      'Follow_x002d_UpNeededforCause_x0': data.FollowUpNeededForCause3,
      'CauseandEffectAnalysis_x0023_3': data.CauseAndEffectAnalysis3,
      'Follow_x002d_UpNeededforCause_x00': data.FollowUpNeededForCause4,
      'CauseandEffectAnalysis_x0023_4': data.CauseAndEffectAnalysis4,
      'Follow_x002d_UpNeededforCause_x01': data.FollowUpNeededForCause5,
      'CauseandEffectAnalysis_x0023_5': data.CauseAndEffectAnalysis5,

      RootCause0: data.RootCause,
      CompletionDate: data.CompletionDate,
      VerifiedById: parseUser(data.VerifiedBy),

      'ActionPlanStep_x0023_1': data.ActionPlanStep1,
      'ActionPlan_x0023_1ResponsibleId': parseUser(data.ActionPlan1Responsible),
      'DueDatePlan_x0023_1': data.DueDatePlan1,

      'Follow_x002d_UpActionNeeded': data.FollowUpNeededAction2,
      'ActionPlanStep_x0023_2': data.ActionPlanStep2,
      'ActionPlanStep_x0023_2ResponsiblId': parseUser(data.ActionPlan2Responsible),
      'ActionPlan_x0023_2DueDate': data.ActionPlan2DueDate,

      'Follow_x002d_UpNeededAction_x002': data.FollowUpNeededAction3,
      'ActionPlanStep_x0023_3': data.ActionPlanStep3,
      'ActionPlan_x0023_3ResponsibleId': parseUser(data.ActionPlan3Responsible),
      'ActionPlan_x0023_3DueDate': data.ActionPlan3DueDate,

      'Follow_x002d_UpNeededAction_x0020': data.FollowUpNeededAction4,
      'ActionPlanStep_x0023_4': data.ActionPlanStep4,
      'ActionPlan_x0023_4ResponsibleId': parseUser(data.ActionPlan4Responsible),
      'ActionPlan_x0023_4DueDate': data.ActionPlan4DueDate,

      'Follow_x002d_UpNeededAction_x0021': data.FollowUpNeededAction5,
      'ActionPlanStep_x0023_5': data.ActionPlanStep5,
      'ActionPlan_x0023_5ResponsibleId': parseUser(data.ActionPlan5Responsible),
      'ActionPlan_x0023_5DueDate': data.ActionPlan5DueDate,

      ActionEffectivenessVerification: data.ActionEffectivenessVerification,
      ActionEffectivenessVerificationD: data.ActionEffectivenessVerificationDate,
      QAAuditorId: parseUser(data.QAAuditor),
      Comments: data.Comments,
      CCListId: data.CCList
        ? {
            results: data.CCList
              .split(';')
              .filter(pair => pair)
              .map(pair => parseInt(pair.includes('|') ? pair.split('|')[0] : pair))
          }
        : null,
      CAPAStatus: data.CAPAStatus,
      'IsRiskAlreadyIdentified_x003f_': data.IsRiskAlreadyIdentified,
      'UpdateRiskAnalysisMatrix_x003f_': data.UpdateRiskAnalysisMatrix
    };
  }
}
