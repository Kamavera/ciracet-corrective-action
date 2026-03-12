import * as React from 'react';
import {
  TextField,
  Dropdown,
  IDropdownOption,
  DatePicker,
  Toggle,
  Label,
  Stack,
  IStackTokens
} from '@fluentui/react';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import { WebPartContext } from '@microsoft/sp-webpart-base';

const stackTokens: IStackTokens = { childrenGap: 10 };

export interface ITextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  placeholder?: string;
}

export const FormTextField: React.FC<ITextFieldProps> = (props) => {
  return (
    <TextField
      label={props.label}
      value={props.value}
      onChange={(_, newValue) => props.onChange(newValue || '')}
      required={props.required}
      multiline={props.multiline}
      rows={props.rows}
      disabled={props.disabled}
      placeholder={props.placeholder}
    />
  );
};

export interface IDropdownFieldProps {
  label: string;
  selectedKey: string | number;
  options: IDropdownOption[];
  onChange: (value: string | number) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const FormDropdown: React.FC<IDropdownFieldProps> = (props) => {
  return (
    <Dropdown
      label={props.label}
      selectedKey={props.selectedKey}
      options={props.options}
      onChange={(_, option) => props.onChange(option?.key || '')}
      required={props.required}
      disabled={props.disabled}
      placeholder={props.placeholder}
    />
  );
};

export interface IDateFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
  disabled?: boolean;
}

export const FormDatePicker: React.FC<IDateFieldProps> = (props) => {
  return (
    <DatePicker
      label={props.label}
      value={props.value || undefined}
      onSelectDate={(date) => props.onChange(date || null)}
      isRequired={props.required}
      disabled={props.disabled}
      formatDate={(date) => date ? date.toLocaleDateString() : ''}
    />
  );
};

export interface IToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const FormToggle: React.FC<IToggleFieldProps> = (props) => {
  return (
    <Toggle
      label={props.label}
      checked={props.checked}
      onChange={(_, checked) => props.onChange(checked || false)}
      disabled={props.disabled}
    />
  );
};

export interface IActionPlanStepProps {
  stepNumber: number;
  stepValue: string;
  responsiblePerson: string;
  dueDate: Date | null;
  onStepChange: (value: string) => void;
  onResponsiblePersonChange: (value: string) => void;
  onDueDateChange: (date: Date | null) => void;
  context: WebPartContext;
}

export const ActionPlanStep: React.FC<IActionPlanStepProps> = (props) => {
  return (
    <Stack tokens={stackTokens} styles={{ root: { padding: '10px', border: '1px solid #edebe9', borderRadius: '4px' } }}>
      <Label>Action Plan Step #{props.stepNumber}</Label>
      <TextField
        label={`Step ${props.stepNumber} Description`}
        value={props.stepValue}
        onChange={(_, newValue) => props.onStepChange(newValue || '')}
        multiline
        rows={2}
        placeholder={`Describe action step ${props.stepNumber}...`}
      />
      <Stack horizontal tokens={stackTokens}>
        <Stack.Item grow={1}>
          <PeoplePicker
            context={props.context as any}
            titleText="Responsible Person"
            personSelectionLimit={1}
            showtooltip={true}
            required={false}
            ensureUser={true}
            onChange={(items) => {
              if (items && items.length > 0) {
                // Store both ID and loginName
                const item = items[0] as any;
                props.onResponsiblePersonChange(`${item.id}|${item.loginName}`);
              } else {
                props.onResponsiblePersonChange('');
              }
            }}
            defaultSelectedUsers={props.responsiblePerson ? [props.responsiblePerson.includes('|') ? props.responsiblePerson.split('|')[1] : props.responsiblePerson] : []}
            principalTypes={[PrincipalType.User]}
            resolveDelay={300}
            webAbsoluteUrl={props.context.pageContext.web.absoluteUrl}
          />
        </Stack.Item>
        <Stack.Item grow={1}>
          <DatePicker
            label="Due Date"
            value={props.dueDate || undefined}
            onSelectDate={(date) => props.onDueDateChange(date || null)}
            formatDate={(date) => date ? date.toLocaleDateString() : ''}
          />
        </Stack.Item>
      </Stack>
    </Stack>
  );
};

export interface ICauseAndEffectFieldProps {
  analysisNumber: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const CauseAndEffectField: React.FC<ICauseAndEffectFieldProps> = (props) => {
  return (
    <TextField
      label={`Cause and Effect Analysis #${props.analysisNumber}`}
      value={props.value}
      onChange={(_, newValue) => props.onChange(newValue || '')}
      multiline
      rows={2}
      disabled={props.disabled}
      placeholder={`Enter cause and effect analysis ${props.analysisNumber}...`}
    />
  );
};
