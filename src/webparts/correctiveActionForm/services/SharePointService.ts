import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI, spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/items/get-all';
import '@pnp/sp/site-users/web';
import { ICorrectiveAction, INonConformity, IDropdownOption } from '../models/ICorrectiveAction';

export class SharePointService {
  private sp: SPFI;
  private context: WebPartContext;

  constructor(context: WebPartContext) {
    this.context = context;
    this.sp = spfi().using(SPFx(context));
  }

  /**
   * Get all Non Conformities for dropdown
   */
  public async getNonConformities(): Promise<IDropdownOption[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle('Non Conformities')
        .items
        .select('Id', 'Title', 'ReferenceID')
        .orderBy('Created', false)
        .top(100)();

      return items.map(item => ({
        key: item.ReferenceID,
        text: `${item.ReferenceID} - ${item.Title}`
      }));
    } catch (error) {
      console.error('Error fetching Non Conformities:', error);
      throw new Error('Failed to load Non Conformities list');
    }
  }

  /**
   * Get Non Conformity details by Reference ID
   */
  public async getNonConformityByReferenceId(referenceId: string): Promise<INonConformity | null> {
    try {
      console.log('Fetching NC with ReferenceID:', referenceId);

      // Query all fields without specifying them
      const items = await this.sp.web.lists
        .getByTitle('Non Conformities')
        .items
        .filter(`ReferenceID eq '${referenceId}'`)
        .top(1)();

      console.log('Found NC item with all fields:', items);

      if (items.length > 0) {
        const item = items[0];

        // Log all property names to see what's available
        console.log('Available NC properties:', Object.keys(item));
        console.log('Full NC item:', item);

        const mapped = {
          Id: item.Id,
          Title: item.Title || '',
          ReferenceID: item.ReferenceID || '',
          ReportedBy: item.ReportedBy || '',
          ReportedDate: item.ReportedBy ? new Date(item.ReportedBy) : new Date(),
          IssueDescription: item.Description || '',
          PlaceOfNC: item.PlaceofNC || '',
          CauseAndEffectAnalysis1: item['CauseandEffectAnalysis_x0023_1'] || '',
          CauseAndEffectAnalysis2: item['CauseandEffectAnalysis_x0023_2'] || '',
          CauseAndEffectAnalysis3: item['CauseandEffectAnalysis_x0023_3'] || '',
          CauseAndEffectAnalysis4: item['CauseandEffectAnalysis_x0023_4'] || '',
          CauseAndEffectAnalysis5: item['CauseandEffectAnalysis_x0023_5'] || '',
          RootCause: item.RootCause || '',
          SeverityOfNC: item.SeverityofNC || '',
          AssignedTo: item.AssignedtoId ? String(item.AssignedtoId) : '',
          TargetResolutionDate: item.TargetResolutionDate ? new Date(item.TargetResolutionDate) : new Date(),
          Status: item.Status || ''
        };

        console.log('Mapped NC data:', mapped);
        return mapped;
      }
      return null;
    } catch (error) {
      console.error('Error fetching Non Conformity details:', error);
      console.error('Error details:', error);
      return null;
    }
  }

  /**
   * Get Corrective Actions created by or assigned to current user
   */
  public async getMyCorrectiveActions(): Promise<ICorrectiveAction[]> {
    try {
      console.log('Fetching current user...');
      const currentUser = await this.sp.web.currentUser();
      console.log('Current user:', currentUser);

      console.log('Fetching Corrective Actions...');
      const items = await this.sp.web.lists
        .getByTitle('Corrective Actions')
        .items
        .filter(`(Author/Id eq ${currentUser.Id}) or (ResponsiblePerson eq ${currentUser.Id})`)
        .select('*', 'Noconformidades/ReferenceID', 'Noconformidades/Title')
        .expand('Noconformidades')
        .top(50)();

      console.log('Fetched items:', items);

      if (items.length > 0) {
        console.log('First item with lookup expanded:', items[0]);
      }

      const mapped = items.map(item => this.mapToCorrectiveActionSimple(item));
      console.log('Mapped items:', mapped);
      return mapped;
    } catch (error) {
      console.error('Error fetching Corrective Actions:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error('Failed to load Corrective Actions');
    }
  }

  /**
   * Get Corrective Action by ID
   */
  public async getCorrectiveActionById(id: number): Promise<ICorrectiveAction | null> {
    try {
      const item = await this.sp.web.lists
        .getByTitle('Corrective Actions')
        .items
        .getById(id)
        .select('*', 'Noconformidades/ReferenceID', 'Noconformidades/Title')
        .expand('Noconformidades')();

      console.log('Fetched item for edit:', item);

      // Fetch user details separately for each Person field
      const correctionAction = await this.mapToCorrectiveActionWithUsers(item);
      return correctionAction;
    } catch (error) {
      console.error('Error fetching Corrective Action:', error);
      return null;
    }
  }

  /**
   * Simple mapping for list views (without fetching user details)
   */
  private mapToCorrectiveActionSimple(item: any): ICorrectiveAction {
    return {
      Id: item.Id,
      Title: item.Title || '',
      Status: item.Status || 'Not Started',
      ReferenceID: item.ReferenceID || '',
      NCReportNumber: item.Noconformidades?.ReferenceID || '',
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
      CAPAStatus: item.CAPAStatus || 'Open',
      IsRiskAlreadyIdentified: item['IsRiskAlreadyIdentified_x003f_'] || '',
      UpdateRiskAnalysisMatrix: item['UpdateRiskAnalysisMatrix_x003f_'] || ''
    };
  }

  /**
   * Helper to get user login name by ID
   */
  private async getUserLoginNameById(userId: number): Promise<string> {
    try {
      const user = await this.sp.web.siteUsers.getById(userId)();
      return user.LoginName || '';
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return '';
    }
  }

  /**
   * Map item to ICorrectiveAction with user details
   */
  private async mapToCorrectiveActionWithUsers(item: any): Promise<ICorrectiveAction> {
    // Fetch all user login names in parallel
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

    const userLoginNames = await Promise.all(
      userIds.map(id => this.getUserLoginNameById(id))
    );

    // Create a map of userId -> loginName
    const userMap = new Map<number, string>();
    userIds.forEach((id, index) => {
      if (id && userLoginNames[index]) {
        userMap.set(id, userLoginNames[index]);
      }
    });

    // Handle CCList (multiple users)
    let ccListValue = '';
    if (item.CCListId && item.CCListId.results && item.CCListId.results.length > 0) {
      const ccUsers = await Promise.all(
        item.CCListId.results.map((id: number) => this.getUserLoginNameById(id))
      );
      ccListValue = item.CCListId.results
        .map((id: number, index: number) => ccUsers[index] ? `${id}|${ccUsers[index]}` : '')
        .filter((v: string) => v)
        .join(';');
    }

    return {
      Id: item.Id,
      Title: item.Title || '',
      Status: item.Status || 'Not Started',
      ReferenceID: item.ReferenceID || '',
      NCReportNumber: item.Noconformidades?.ReferenceID || '',
      PlaceOfNC: item.PlaceofNC || '',
      DueDate: item.DueDate ? new Date(item.DueDate) : null,
      ResponsiblePerson: item.ResponsiblePersonId && userMap.has(item.ResponsiblePersonId)
        ? `${item.ResponsiblePersonId}|${userMap.get(item.ResponsiblePersonId)}`
        : '',
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
      VerifiedBy: item.VerifiedById && userMap.has(item.VerifiedById)
        ? `${item.VerifiedById}|${userMap.get(item.VerifiedById)}`
        : '',

      ActionPlanStep1: item['ActionPlanStep_x0023_1'] || '',
      ActionPlan1Responsible: item['ActionPlan_x0023_1ResponsibleId'] && userMap.has(item['ActionPlan_x0023_1ResponsibleId'])
        ? `${item['ActionPlan_x0023_1ResponsibleId']}|${userMap.get(item['ActionPlan_x0023_1ResponsibleId'])}`
        : '',
      DueDatePlan1: item['DueDatePlan_x0023_1'] ? new Date(item['DueDatePlan_x0023_1']) : null,

      FollowUpNeededAction2: item['Follow_x002d_UpActionNeeded'] || '',
      ActionPlanStep2: item['ActionPlanStep_x0023_2'] || '',
      ActionPlan2Responsible: item['ActionPlanStep_x0023_2ResponsiblId'] && userMap.has(item['ActionPlanStep_x0023_2ResponsiblId'])
        ? `${item['ActionPlanStep_x0023_2ResponsiblId']}|${userMap.get(item['ActionPlanStep_x0023_2ResponsiblId'])}`
        : '',
      ActionPlan2DueDate: item['ActionPlan_x0023_2DueDate'] ? new Date(item['ActionPlan_x0023_2DueDate']) : null,

      FollowUpNeededAction3: item['Follow_x002d_UpNeededAction_x002'] || '',
      ActionPlanStep3: item['ActionPlanStep_x0023_3'] || '',
      ActionPlan3Responsible: item['ActionPlan_x0023_3ResponsibleId'] && userMap.has(item['ActionPlan_x0023_3ResponsibleId'])
        ? `${item['ActionPlan_x0023_3ResponsibleId']}|${userMap.get(item['ActionPlan_x0023_3ResponsibleId'])}`
        : '',
      ActionPlan3DueDate: item['ActionPlan_x0023_3DueDate'] ? new Date(item['ActionPlan_x0023_3DueDate']) : null,

      FollowUpNeededAction4: item['Follow_x002d_UpNeededAction_x0020'] || '',
      ActionPlanStep4: item['ActionPlanStep_x0023_4'] || '',
      ActionPlan4Responsible: item['ActionPlan_x0023_4ResponsibleId'] && userMap.has(item['ActionPlan_x0023_4ResponsibleId'])
        ? `${item['ActionPlan_x0023_4ResponsibleId']}|${userMap.get(item['ActionPlan_x0023_4ResponsibleId'])}`
        : '',
      ActionPlan4DueDate: item['ActionPlan_x0023_4DueDate'] ? new Date(item['ActionPlan_x0023_4DueDate']) : null,

      FollowUpNeededAction5: item['Follow_x002d_UpNeededAction_x0021'] || '',
      ActionPlanStep5: item['ActionPlanStep_x0023_5'] || '',
      ActionPlan5Responsible: item['ActionPlan_x0023_5ResponsibleId'] && userMap.has(item['ActionPlan_x0023_5ResponsibleId'])
        ? `${item['ActionPlan_x0023_5ResponsibleId']}|${userMap.get(item['ActionPlan_x0023_5ResponsibleId'])}`
        : '',
      ActionPlan5DueDate: item['ActionPlan_x0023_5DueDate'] ? new Date(item['ActionPlan_x0023_5DueDate']) : null,

      ActionEffectivenessVerification: item.ActionEffectivenessVerification || '',
      ActionEffectivenessVerificationDate: item.ActionEffectivenessVerificationD ? new Date(item.ActionEffectivenessVerificationD) : null,
      QAAuditor: item.QAAuditorId && userMap.has(item.QAAuditorId)
        ? `${item.QAAuditorId}|${userMap.get(item.QAAuditorId)}`
        : '',
      Comments: item.Comments || '',
      CCList: ccListValue,
      CAPAStatus: item.CAPAStatus || 'Open',
      IsRiskAlreadyIdentified: item['IsRiskAlreadyIdentified_x003f_'] || '',
      UpdateRiskAnalysisMatrix: item['UpdateRiskAnalysisMatrix_x003f_'] || ''
    };
  }

  /**
   * Create new Corrective Action
   */
  public async createCorrectiveAction(data: ICorrectiveAction): Promise<number> {
    try {
      const itemData = this.mapFromCorrectiveAction(data);
      console.log('Mapped item data for SharePoint:', itemData);
      console.log('ResponsiblePersonId:', itemData.ResponsiblePersonId);
      console.log('VerifiedById:', itemData.VerifiedById);
      console.log('CCListId:', itemData.CCListId);

      const result = await this.sp.web.lists
        .getByTitle('Corrective Actions')
        .items
        .add(itemData);

      console.log('Created item result:', result);
      return result.data.Id;
    } catch (error) {
      console.error('Error creating Corrective Action:', error);
      console.error('Full error details:', error);
      throw new Error('Failed to create Corrective Action');
    }
  }

  /**
   * Update existing Corrective Action
   */
  public async updateCorrectiveAction(id: number, data: ICorrectiveAction): Promise<void> {
    try {
      const itemData = this.mapFromCorrectiveAction(data);
      await this.sp.web.lists
        .getByTitle('Corrective Actions')
        .items
        .getById(id)
        .update(itemData);
    } catch (error) {
      console.error('Error updating Corrective Action:', error);
      throw new Error('Failed to update Corrective Action');
    }
  }

  /**
   * Delete Corrective Action
   */
  public async deleteCorrectiveAction(id: number): Promise<void> {
    try {
      await this.sp.web.lists
        .getByTitle('Corrective Actions')
        .items
        .getById(id)
        .delete();
    } catch (error) {
      console.error('Error deleting Corrective Action:', error);
      throw new Error('Failed to delete Corrective Action');
    }
  }

  /**
   * Generate Corrective Action Reference ID from NC Reference ID
   * Example: "NC 2024-03" becomes "AC 2024-03"
   */
  public generateCorrectiveActionReferenceId(ncReferenceId: string): string {
    if (ncReferenceId.startsWith('NC ')) {
      return ncReferenceId.replace('NC ', 'AC ');
    } else if (ncReferenceId.startsWith('NC-')) {
      return ncReferenceId.replace('NC-', 'AC-');
    }
    return 'AC ' + ncReferenceId;
  }


  /**
   * Map ICorrectiveAction to SharePoint item format
   */
  private mapFromCorrectiveAction(data: ICorrectiveAction): any {
    return {
      Title: data.Title,
      Status: data.Status,
      ReferenceID: data.ReferenceID,
      // NoconformidadesId is a lookup field - don't update it directly
      PlaceofNC: data.PlaceOfNC,
      DueDate: data.DueDate,
      ResponsiblePersonId: data.ResponsiblePerson ? parseInt(data.ResponsiblePerson.includes('|') ? data.ResponsiblePerson.split('|')[0] : data.ResponsiblePerson) : null,
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
      VerifiedById: data.VerifiedBy ? parseInt(data.VerifiedBy.includes('|') ? data.VerifiedBy.split('|')[0] : data.VerifiedBy) : null,

      'ActionPlanStep_x0023_1': data.ActionPlanStep1,
      'ActionPlan_x0023_1ResponsibleId': data.ActionPlan1Responsible ? parseInt(data.ActionPlan1Responsible.includes('|') ? data.ActionPlan1Responsible.split('|')[0] : data.ActionPlan1Responsible) : null,
      'DueDatePlan_x0023_1': data.DueDatePlan1,

      'Follow_x002d_UpActionNeeded': data.FollowUpNeededAction2,
      'ActionPlanStep_x0023_2': data.ActionPlanStep2,
      'ActionPlanStep_x0023_2ResponsiblId': data.ActionPlan2Responsible ? parseInt(data.ActionPlan2Responsible.includes('|') ? data.ActionPlan2Responsible.split('|')[0] : data.ActionPlan2Responsible) : null,
      'ActionPlan_x0023_2DueDate': data.ActionPlan2DueDate,

      'Follow_x002d_UpNeededAction_x002': data.FollowUpNeededAction3,
      'ActionPlanStep_x0023_3': data.ActionPlanStep3,
      'ActionPlan_x0023_3ResponsibleId': data.ActionPlan3Responsible ? parseInt(data.ActionPlan3Responsible.includes('|') ? data.ActionPlan3Responsible.split('|')[0] : data.ActionPlan3Responsible) : null,
      'ActionPlan_x0023_3DueDate': data.ActionPlan3DueDate,

      'Follow_x002d_UpNeededAction_x0020': data.FollowUpNeededAction4,
      'ActionPlanStep_x0023_4': data.ActionPlanStep4,
      'ActionPlan_x0023_4ResponsibleId': data.ActionPlan4Responsible ? parseInt(data.ActionPlan4Responsible.includes('|') ? data.ActionPlan4Responsible.split('|')[0] : data.ActionPlan4Responsible) : null,
      'ActionPlan_x0023_4DueDate': data.ActionPlan4DueDate,

      'Follow_x002d_UpNeededAction_x0021': data.FollowUpNeededAction5,
      'ActionPlanStep_x0023_5': data.ActionPlanStep5,
      'ActionPlan_x0023_5ResponsibleId': data.ActionPlan5Responsible ? parseInt(data.ActionPlan5Responsible.includes('|') ? data.ActionPlan5Responsible.split('|')[0] : data.ActionPlan5Responsible) : null,
      'ActionPlan_x0023_5DueDate': data.ActionPlan5DueDate,

      ActionEffectivenessVerification: data.ActionEffectivenessVerification,
      ActionEffectivenessVerificationD: data.ActionEffectivenessVerificationDate,
      QAAuditorId: data.QAAuditor ? parseInt(data.QAAuditor.includes('|') ? data.QAAuditor.split('|')[0] : data.QAAuditor) : null,
      Comments: data.Comments,
      CCListId: data.CCList ? { results: data.CCList.split(';').filter(pair => pair).map(pair => {
        const id = pair.includes('|') ? pair.split('|')[0] : pair;
        return parseInt(id);
      }) } : null,
      CAPAStatus: data.CAPAStatus,
      'IsRiskAlreadyIdentified_x003f_': data.IsRiskAlreadyIdentified,
      'UpdateRiskAnalysisMatrix_x003f_': data.UpdateRiskAnalysisMatrix
    };
  }
}
