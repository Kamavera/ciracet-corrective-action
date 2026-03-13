import * as React from 'react';
import {
  Stack,
  PrimaryButton,
  DefaultButton,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  IStackTokens,
  Separator,
  Dialog,
  DialogType,
  DialogFooter,
  Dropdown,
  IDropdownOption as IFluentDropdownOption,
  ChoiceGroup,
  IChoiceGroupOption
} from '@fluentui/react';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SharePointService } from '../services/SharePointService';
import { ICorrectiveAction, CAPAStatusOptions, IDropdownOption } from '../models/ICorrectiveAction';
import {
  FormTextField,
  FormDropdown,
  FormDatePicker,
  ActionPlanStep,
  CauseAndEffectField
} from './FormFields';

export interface ICorrectiveActionFormProps {
  context: WebPartContext;
  itemId?: number;
  onSave?: () => void;
  onCancel?: () => void;
}

const stackTokens: IStackTokens = { childrenGap: 15 };
const sectionTokens: IStackTokens = { childrenGap: 10 };

const yesNoOptions: IChoiceGroupOption[] = [
  { key: 'YES', text: 'YES' },
  { key: 'NO', text: 'NO' }
];

export const CorrectiveActionForm: React.FC<ICorrectiveActionFormProps> = (props) => {
  const [formData, setFormData] = React.useState<ICorrectiveAction>({
    Title: '',
    Status: 'Abierta',
    ReferenceID: '',
    NCReportNumber: '',
    PlaceOfNC: '',
    DueDate: null,
    ResponsiblePerson: '',
    IssueDescription: '',
    CauseAndEffectAnalysis1: '',
    FollowUpNeededForCause2: '',
    CauseAndEffectAnalysis2: '',
    FollowUpNeededForCause3: '',
    CauseAndEffectAnalysis3: '',
    FollowUpNeededForCause4: '',
    CauseAndEffectAnalysis4: '',
    FollowUpNeededForCause5: '',
    CauseAndEffectAnalysis5: '',
    RootCause: '',
    CompletionDate: null,
    VerifiedBy: '',
    ActionPlanStep1: '',
    ActionPlan1Responsible: '',
    DueDatePlan1: null,
    FollowUpNeededAction2: '',
    ActionPlanStep2: '',
    ActionPlan2Responsible: '',
    ActionPlan2DueDate: null,
    FollowUpNeededAction3: '',
    ActionPlanStep3: '',
    ActionPlan3Responsible: '',
    ActionPlan3DueDate: null,
    FollowUpNeededAction4: '',
    ActionPlanStep4: '',
    ActionPlan4Responsible: '',
    ActionPlan4DueDate: null,
    FollowUpNeededAction5: '',
    ActionPlanStep5: '',
    ActionPlan5Responsible: '',
    ActionPlan5DueDate: null,
    ActionEffectivenessVerification: '',
    ActionEffectivenessVerificationDate: null,
    QAAuditor: '',
    Comments: '',
    CCList: '',
    CAPAStatus: 'Abierta',
    IsRiskAlreadyIdentified: '',
    UpdateRiskAnalysisMatrix: ''
  });

  const [ncOptions, setNcOptions] = React.useState<IDropdownOption[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [success, setSuccess] = React.useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = React.useState<boolean>(false);
  const [isEditMode, setIsEditMode] = React.useState<boolean>(false);

  const spService = React.useMemo(() => new SharePointService(props.context), [props.context]);

  React.useEffect(() => {
    loadInitialData();
  }, [props.itemId]);

  const loadInitialData = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const options = await spService.getNonConformities();
      setNcOptions(options);

      if (props.itemId) {
        const item = await spService.getCorrectiveActionById(props.itemId);
        if (item) {
          setFormData(item);
          setIsEditMode(true);
        } else {
          setError('Corrective Action not found');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleNCReportNumberChange = async (ncReferenceId: string): Promise<void> => {
    setFormData(prev => ({ ...prev, NCReportNumber: ncReferenceId }));

    if (!ncReferenceId) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const ncData = await spService.getNonConformityByReferenceId(ncReferenceId);

      if (ncData) {
        const acReferenceId = spService.generateCorrectiveActionReferenceId(ncReferenceId);

        setFormData(prev => ({
          ...prev,
          NCReportNumber: ncReferenceId,
          ReferenceID: acReferenceId,
          Title: ncData.Title,
          PlaceOfNC: ncData.PlaceOfNC,
          IssueDescription: ncData.IssueDescription,
          CauseAndEffectAnalysis1: ncData.CauseAndEffectAnalysis1,
          CauseAndEffectAnalysis2: ncData.CauseAndEffectAnalysis2,
          CauseAndEffectAnalysis3: ncData.CauseAndEffectAnalysis3,
          CauseAndEffectAnalysis4: ncData.CauseAndEffectAnalysis4,
          CauseAndEffectAnalysis5: ncData.CauseAndEffectAnalysis5,
          RootCause: ncData.RootCause,
          ResponsiblePerson: ncData.AssignedTo,
          DueDate: ncData.TargetResolutionDate
        }));

        setSuccess('Data auto-populated from Non Conformity');
      }
    } catch (err) {
      setError(err.message || 'Failed to auto-populate data');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof ICorrectiveAction, value: any): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.Title) {
      setError('Title is required');
      return false;
    }
    if (!formData.NCReportNumber) {
      setError('NC Report Number is required');
      return false;
    }
    if (!formData.ReferenceID) {
      setError('Corrective Action Reference ID is required');
      return false;
    }
    return true;
  };

  const handleSave = async (): Promise<void> => {
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      console.log('Saving formData:', formData);
      console.log('ResponsiblePerson value:', formData.ResponsiblePerson);
      console.log('VerifiedBy value:', formData.VerifiedBy);
      console.log('CCList value:', formData.CCList);

      if (isEditMode && props.itemId) {
        await spService.updateCorrectiveAction(props.itemId, formData);
        setSuccess('Corrective Action updated successfully!');
      } else {
        await spService.createCorrectiveAction(formData);
        setSuccess('Corrective Action created successfully!');
      }

      setTimeout(() => {
        if (props.onSave) {
          props.onSave();
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save Corrective Action');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitClick = (): void => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = (): void => {
    setShowConfirmDialog(false);
    handleSave();
  };

  const handleCancel = (): void => {
    if (props.onCancel) {
      props.onCancel();
    }
  };

  if (loading) {
    return (
      <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { padding: 50 } }}>
        <Spinner size={SpinnerSize.large} label="Loading..." />
      </Stack>
    );
  }

  return (
    <Stack tokens={stackTokens} styles={{ root: { padding: 20, maxWidth: 1200 } }}>
      <h2>{isEditMode ? 'Edit Corrective Action' : 'New Corrective Action'}</h2>

      {error && <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError('')}>{error}</MessageBar>}
      {success && <MessageBar messageBarType={MessageBarType.success} onDismiss={() => setSuccess('')}>{success}</MessageBar>}

      {/* Basic Information */}
      <Separator>Basic Information</Separator>
      <Stack tokens={sectionTokens}>
        <Stack horizontal tokens={sectionTokens}>
          <Stack.Item grow={1}>
            <FormTextField
              label="Title"
              value={formData.Title}
              onChange={(value) => updateField('Title', value)}
              required={true}
            />
          </Stack.Item>
          <Stack.Item grow={1}>
            <FormDropdown
              label="Status"
              selectedKey={formData.Status}
              options={CAPAStatusOptions}
              onChange={(value) => updateField('Status', value)}
              required={true}
            />
          </Stack.Item>
        </Stack>

        <FormDropdown
          label="NC Report Number"
          selectedKey={formData.NCReportNumber}
          options={ncOptions}
          onChange={handleNCReportNumberChange}
          required={true}
          placeholder="Select a Non Conformity"
          disabled={isEditMode}
        />

        <FormTextField
          label="Corrective Action Reference ID"
          value={formData.ReferenceID}
          onChange={(value) => updateField('ReferenceID', value)}
          required={true}
          disabled={true}
        />

        <Stack horizontal tokens={sectionTokens}>
          <Stack.Item grow={1}>
            <FormTextField
              label="Place of NC"
              value={formData.PlaceOfNC}
              onChange={(value) => updateField('PlaceOfNC', value)}
            />
          </Stack.Item>
          <Stack.Item grow={1}>
            <PeoplePicker
              context={props.context as any}
              titleText="Responsible Person"
              personSelectionLimit={1}
              showtooltip={true}
              required={false}
              disabled={loading}
              ensureUser={true}
              onChange={(items) => {
                console.log('PeoplePicker onChange - Responsible Person:', items);
                if (items && items.length > 0) {
                  console.log('First item:', items[0]);
                  console.log('Item ID:', items[0].id);
                  console.log('Item keys:', Object.keys(items[0]));
                  // Store both ID and loginName
                  const item = items[0] as any;
                  updateField('ResponsiblePerson', `${item.id}|${item.loginName}`);
                } else {
                  updateField('ResponsiblePerson', '');
                }
              }}
              defaultSelectedUsers={formData.ResponsiblePerson ? [formData.ResponsiblePerson.includes('|') ? formData.ResponsiblePerson.split('|')[1] : formData.ResponsiblePerson] : []}
              principalTypes={[PrincipalType.User]}
              resolveDelay={300}
              webAbsoluteUrl={props.context.pageContext.web.absoluteUrl}
            />
          </Stack.Item>
        </Stack>

        <Stack horizontal tokens={sectionTokens}>
          <Stack.Item grow={1}>
            <FormDatePicker
              label="Due Date"
              value={formData.DueDate}
              onChange={(date) => updateField('DueDate', date)}
            />
          </Stack.Item>
          <Stack.Item grow={1}>
            <FormDatePicker
              label="Completion Date"
              value={formData.CompletionDate}
              onChange={(date) => updateField('CompletionDate', date)}
            />
          </Stack.Item>
        </Stack>

        <PeoplePicker
          context={props.context as any}
          titleText="Verified By"
          personSelectionLimit={1}
          showtooltip={true}
          required={false}
          disabled={loading}
          ensureUser={true}
          onChange={(items) => {
            if (items && items.length > 0) {
              const item = items[0] as any;
              updateField('VerifiedBy', `${item.id}|${item.loginName}`);
            } else {
              updateField('VerifiedBy', '');
            }
          }}
          defaultSelectedUsers={formData.VerifiedBy ? [formData.VerifiedBy.includes('|') ? formData.VerifiedBy.split('|')[1] : formData.VerifiedBy] : []}
          principalTypes={[PrincipalType.User]}
          resolveDelay={300}
          webAbsoluteUrl={props.context.pageContext.web.absoluteUrl}
        />
      </Stack>

      {/* Issue Description & Analysis */}
      <Separator>Issue Description & Root Cause Analysis</Separator>
      <Stack tokens={sectionTokens}>
        <FormTextField
          label="Issue Description"
          value={formData.IssueDescription}
          onChange={(value) => updateField('IssueDescription', value)}
          multiline={true}
          rows={3}
          disabled={true}
        />

        <CauseAndEffectField
          analysisNumber={1}
          value={formData.CauseAndEffectAnalysis1}
          onChange={(value) => updateField('CauseAndEffectAnalysis1', value)}
          disabled={true}
        />

        <ChoiceGroup
          label="Follow-Up Needed for Cause #2?"
          selectedKey={formData.FollowUpNeededForCause2}
          options={yesNoOptions}
          onChange={(_, option) => updateField('FollowUpNeededForCause2', option?.key || '')}
        />

        {formData.FollowUpNeededForCause2 === 'YES' && (
          <CauseAndEffectField
            analysisNumber={2}
            value={formData.CauseAndEffectAnalysis2}
            onChange={(value) => updateField('CauseAndEffectAnalysis2', value)}
            disabled={true}
          />
        )}

        <ChoiceGroup
          label="Follow-Up Needed for Cause #3?"
          selectedKey={formData.FollowUpNeededForCause3}
          options={yesNoOptions}
          onChange={(_, option) => updateField('FollowUpNeededForCause3', option?.key || '')}
        />

        {formData.FollowUpNeededForCause3 === 'YES' && (
          <CauseAndEffectField
            analysisNumber={3}
            value={formData.CauseAndEffectAnalysis3}
            onChange={(value) => updateField('CauseAndEffectAnalysis3', value)}
            disabled={true}
          />
        )}

        <ChoiceGroup
          label="Follow-Up Needed for Cause #4?"
          selectedKey={formData.FollowUpNeededForCause4}
          options={yesNoOptions}
          onChange={(_, option) => updateField('FollowUpNeededForCause4', option?.key || '')}
        />

        {formData.FollowUpNeededForCause4 === 'YES' && (
          <CauseAndEffectField
            analysisNumber={4}
            value={formData.CauseAndEffectAnalysis4}
            onChange={(value) => updateField('CauseAndEffectAnalysis4', value)}
            disabled={true}
          />
        )}

        <ChoiceGroup
          label="Follow-Up Needed for Cause #5?"
          selectedKey={formData.FollowUpNeededForCause5}
          options={yesNoOptions}
          onChange={(_, option) => updateField('FollowUpNeededForCause5', option?.key || '')}
        />

        {formData.FollowUpNeededForCause5 === 'YES' && (
          <CauseAndEffectField
            analysisNumber={5}
            value={formData.CauseAndEffectAnalysis5}
            onChange={(value) => updateField('CauseAndEffectAnalysis5', value)}
            disabled={true}
          />
        )}

        <FormTextField
          label="Root Cause"
          value={formData.RootCause}
          onChange={(value) => updateField('RootCause', value)}
          multiline={true}
          rows={3}
          disabled={true}
        />
      </Stack>

      {/* Action Plan */}
      <Separator>Action Plan</Separator>
      <Stack tokens={sectionTokens}>
        <ActionPlanStep
          stepNumber={1}
          stepValue={formData.ActionPlanStep1}
          responsiblePerson={formData.ActionPlan1Responsible}
          dueDate={formData.DueDatePlan1}
          onStepChange={(value) => updateField('ActionPlanStep1', value)}
          onResponsiblePersonChange={(value) => updateField('ActionPlan1Responsible', value)}
          onDueDateChange={(date) => updateField('DueDatePlan1', date)}
          context={props.context}
        />

        <ChoiceGroup
          label="Follow-Up Needed Action #2?"
          selectedKey={formData.FollowUpNeededAction2}
          options={yesNoOptions}
          onChange={(_, option) => updateField('FollowUpNeededAction2', option?.key || '')}
        />

        {formData.FollowUpNeededAction2 === 'YES' && (
          <ActionPlanStep
            stepNumber={2}
            stepValue={formData.ActionPlanStep2}
            responsiblePerson={formData.ActionPlan2Responsible}
            dueDate={formData.ActionPlan2DueDate}
            onStepChange={(value) => updateField('ActionPlanStep2', value)}
            onResponsiblePersonChange={(value) => updateField('ActionPlan2Responsible', value)}
            onDueDateChange={(date) => updateField('ActionPlan2DueDate', date)}
            context={props.context}
          />
        )}

        <ChoiceGroup
          label="Follow-Up Needed Action #3?"
          selectedKey={formData.FollowUpNeededAction3}
          options={yesNoOptions}
          onChange={(_, option) => updateField('FollowUpNeededAction3', option?.key || '')}
        />

        {formData.FollowUpNeededAction3 === 'YES' && (
          <ActionPlanStep
            stepNumber={3}
            stepValue={formData.ActionPlanStep3}
            responsiblePerson={formData.ActionPlan3Responsible}
            dueDate={formData.ActionPlan3DueDate}
            onStepChange={(value) => updateField('ActionPlanStep3', value)}
            onResponsiblePersonChange={(value) => updateField('ActionPlan3Responsible', value)}
            onDueDateChange={(date) => updateField('ActionPlan3DueDate', date)}
            context={props.context}
          />
        )}

        <ChoiceGroup
          label="Follow-Up Needed Action #4?"
          selectedKey={formData.FollowUpNeededAction4}
          options={yesNoOptions}
          onChange={(_, option) => updateField('FollowUpNeededAction4', option?.key || '')}
        />

        {formData.FollowUpNeededAction4 === 'YES' && (
          <ActionPlanStep
            stepNumber={4}
            stepValue={formData.ActionPlanStep4}
            responsiblePerson={formData.ActionPlan4Responsible}
            dueDate={formData.ActionPlan4DueDate}
            onStepChange={(value) => updateField('ActionPlanStep4', value)}
            onResponsiblePersonChange={(value) => updateField('ActionPlan4Responsible', value)}
            onDueDateChange={(date) => updateField('ActionPlan4DueDate', date)}
            context={props.context}
          />
        )}

        <ChoiceGroup
          label="Follow-Up Needed Action #5?"
          selectedKey={formData.FollowUpNeededAction5}
          options={yesNoOptions}
          onChange={(_, option) => updateField('FollowUpNeededAction5', option?.key || '')}
        />

        {formData.FollowUpNeededAction5 === 'YES' && (
          <ActionPlanStep
            stepNumber={5}
            stepValue={formData.ActionPlanStep5}
            responsiblePerson={formData.ActionPlan5Responsible}
            dueDate={formData.ActionPlan5DueDate}
            onStepChange={(value) => updateField('ActionPlanStep5', value)}
            onResponsiblePersonChange={(value) => updateField('ActionPlan5Responsible', value)}
            onDueDateChange={(date) => updateField('ActionPlan5DueDate', date)}
            context={props.context}
          />
        )}
      </Stack>

      {/* Verification & Audit */}
      <Separator>Verification & Audit</Separator>
      <Stack tokens={sectionTokens}>
        <FormTextField
          label="Action Effectiveness Verification"
          value={formData.ActionEffectivenessVerification}
          onChange={(value) => updateField('ActionEffectivenessVerification', value)}
          multiline={true}
          rows={3}
        />

        <FormDatePicker
          label="Action Effectiveness Verification Date"
          value={formData.ActionEffectivenessVerificationDate}
          onChange={(date) => updateField('ActionEffectivenessVerificationDate', date)}
        />

        <FormTextField
          label="QA Auditor"
          value={formData.QAAuditor}
          onChange={(value) => updateField('QAAuditor', value)}
        />

        <FormTextField
          label="Comments"
          value={formData.Comments}
          onChange={(value) => updateField('Comments', value)}
          multiline={true}
          rows={3}
        />
      </Stack>

      {/* Additional Information */}
      <Separator>Additional Information</Separator>
      <Stack tokens={sectionTokens}>
        <PeoplePicker
          context={props.context as any}
          titleText="CC List"
          personSelectionLimit={10}
          showtooltip={true}
          required={false}
          disabled={loading}
          ensureUser={true}
          onChange={(items) => {
            if (items && items.length > 0) {
              // Store array of "id|loginName" pairs separated by semicolons
              const values = items.map((item: any) => `${item.id}|${item.loginName}`).join(';');
              updateField('CCList', values);
            } else {
              updateField('CCList', '');
            }
          }}
          defaultSelectedUsers={formData.CCList ? formData.CCList.split(';').filter(pair => pair).map(pair => pair.includes('|') ? pair.split('|')[1] : pair) : []}
          principalTypes={[PrincipalType.User]}
          resolveDelay={300}
          webAbsoluteUrl={props.context.pageContext.web.absoluteUrl}
        />

        <FormDropdown
          label="CAPA Status"
          selectedKey={formData.CAPAStatus}
          options={CAPAStatusOptions}
          onChange={(value) => updateField('CAPAStatus', value)}
        />

        <ChoiceGroup
          label="Is Risk Already Identified?"
          selectedKey={formData.IsRiskAlreadyIdentified}
          options={yesNoOptions}
          onChange={(_, option) => updateField('IsRiskAlreadyIdentified', option?.key || '')}
        />

        <FormTextField
          label="Update Risk Analysis Matrix"
          value={formData.UpdateRiskAnalysisMatrix}
          onChange={(value) => updateField('UpdateRiskAnalysisMatrix', value)}
          multiline={true}
          rows={2}
        />
      </Stack>

      {/* Action Buttons */}
      <Stack horizontal tokens={sectionTokens} horizontalAlign="end" styles={{ root: { marginTop: 20 } }}>
        <DefaultButton text="Cancel" onClick={handleCancel} disabled={saving} />
        <PrimaryButton
          text={isEditMode ? 'Update' : 'Submit'}
          onClick={handleSubmitClick}
          disabled={saving}
        />
      </Stack>

      {/* Confirmation Dialog */}
      <Dialog
        hidden={!showConfirmDialog}
        onDismiss={() => setShowConfirmDialog(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Confirm Submission',
          subText: `Are you sure you want to ${isEditMode ? 'update' : 'create'} this Corrective Action?`
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={handleConfirmSave} text="Yes" />
          <DefaultButton onClick={() => setShowConfirmDialog(false)} text="No" />
        </DialogFooter>
      </Dialog>

      {saving && (
        <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { padding: 20 } }}>
          <Spinner size={SpinnerSize.large} label="Saving..." />
        </Stack>
      )}
    </Stack>
  );
};
