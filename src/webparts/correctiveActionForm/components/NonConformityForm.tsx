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
  IDropdownOption as IFluentDropdownOption
} from '@fluentui/react';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/PeoplePicker';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SharePointService } from '../services/SharePointService';
import {
  INonConformity,
  NCStatusOptions,
  NCTypeOptions,
  AreaOptions,
  ProcessOptions,
  SeverityOptions,
  NC_VALID_TRANSITIONS,
  NCStatus
} from '../models/ICorrectiveAction';
import { FormTextField, FormDropdown, FormDatePicker } from './FormFields';

export interface INonConformityFormProps {
  context: WebPartContext;
  /** If provided the form opens in edit mode for this item ID */
  itemId?: number;
  onSave?: () => void;
  onCancel?: () => void;
}

const stackTokens: IStackTokens = { childrenGap: 15 };
const sectionTokens: IStackTokens = { childrenGap: 10 };

/** Empty form state factory */
const emptyNC = (): INonConformity => ({
  Title: '',
  ReferenceID: '',
  NCType: '',
  Area: '',
  Process: '',
  Severity: '',
  IssueDescription: '',
  PlaceOfNC: '',
  ReportedBy: '',
  ReportedDate: new Date(),
  AssignedTo: '',
  TargetResolutionDate: null,
  ClosureDate: null,
  VerificationResult: '',
  Status: 'Abierta',
  Comments: '',
  CauseAndEffectAnalysis1: '',
  CauseAndEffectAnalysis2: '',
  CauseAndEffectAnalysis3: '',
  CauseAndEffectAnalysis4: '',
  CauseAndEffectAnalysis5: '',
  RootCause: ''
});

export const NonConformityForm: React.FC<INonConformityFormProps> = (props) => {
  const [formData, setFormData] = React.useState<INonConformity>(emptyNC());
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
    if (!props.itemId) return;

    setLoading(true);
    setError('');
    try {
      const item = await spService.getNonConformityById(props.itemId);
      if (item) {
        setFormData(item);
        setIsEditMode(true);
      } else {
        setError('No Conformidad no encontrada');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof INonConformity, value: any): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /** Returns only the valid next statuses for the current status (plus the current one). */
  const allowedStatusOptions = (): IFluentDropdownOption[] => {
    const current = formData.Status as NCStatus;
    const next = NC_VALID_TRANSITIONS[current] || [];
    const allowed = new Set<string>([current, ...next]);
    return NCStatusOptions
      .filter(opt => allowed.has(opt.key as string))
      .map(opt => ({ key: opt.key as string, text: opt.text }));
  };

  const validateForm = (): boolean => {
    if (!formData.Title.trim()) {
      setError('El Título es obligatorio');
      return false;
    }
    if (!formData.NCType) {
      setError('El Tipo de NC es obligatorio');
      return false;
    }
    if (!formData.Area) {
      setError('El Área es obligatoria');
      return false;
    }
    if (!formData.Severity) {
      setError('La Severidad es obligatoria');
      return false;
    }
    if (!formData.IssueDescription.trim()) {
      setError('La Descripción del problema es obligatoria');
      return false;
    }
    return true;
  };

  const handleSave = async (): Promise<void> => {
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setSaving(true);
    try {
      if (isEditMode && props.itemId) {
        await spService.updateNonConformity(props.itemId, formData);
        setSuccess('No Conformidad actualizada exitosamente');
      } else {
        await spService.createNonConformity(formData);
        setSuccess('No Conformidad creada exitosamente');
      }

      setTimeout(() => {
        if (props.onSave) props.onSave();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al guardar la No Conformidad');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { padding: 50 } }}>
        <Spinner size={SpinnerSize.large} label="Cargando..." />
      </Stack>
    );
  }

  return (
    <Stack tokens={stackTokens} styles={{ root: { padding: 20, maxWidth: 1200 } }}>
      {/* Header */}
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <h2 style={{ margin: 0 }}>
          {isEditMode ? 'Editar No Conformidad' : 'Registrar No Conformidad'}
        </h2>
        {isEditMode && formData.ReferenceID && (
          <span style={{ fontSize: 16, color: '#0078d4', fontWeight: 600 }}>
            {formData.ReferenceID}
          </span>
        )}
      </Stack>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError('')}>
          {error}
        </MessageBar>
      )}
      {success && (
        <MessageBar messageBarType={MessageBarType.success} onDismiss={() => setSuccess('')}>
          {success}
        </MessageBar>
      )}

      {/* ── Información General ─────────────────────────────────────────────── */}
      <Separator>Información General</Separator>
      <Stack tokens={sectionTokens}>
        <Stack horizontal tokens={sectionTokens}>
          <Stack.Item grow={2}>
            <FormTextField
              label="Título"
              value={formData.Title}
              onChange={(value) => updateField('Title', value)}
              required={true}
              placeholder="Descripción breve de la no conformidad"
            />
          </Stack.Item>
          <Stack.Item grow={1}>
            <FormDropdown
              label="Estado"
              selectedKey={formData.Status}
              options={isEditMode ? allowedStatusOptions() : [{ key: 'Abierta', text: 'Abierta' }]}
              onChange={(value) => updateField('Status', value)}
              required={true}
              disabled={!isEditMode}
            />
          </Stack.Item>
        </Stack>

        <Stack horizontal tokens={sectionTokens}>
          <Stack.Item grow={1}>
            <FormDropdown
              label="Tipo de NC"
              selectedKey={formData.NCType}
              options={NCTypeOptions}
              onChange={(value) => updateField('NCType', value)}
              required={true}
              placeholder="Seleccionar tipo"
            />
          </Stack.Item>
          <Stack.Item grow={1}>
            <FormDropdown
              label="Severidad"
              selectedKey={formData.Severity}
              options={SeverityOptions}
              onChange={(value) => updateField('Severity', value)}
              required={true}
              placeholder="Seleccionar severidad"
            />
          </Stack.Item>
        </Stack>

        <Stack horizontal tokens={sectionTokens}>
          <Stack.Item grow={1}>
            <FormDropdown
              label="Área"
              selectedKey={formData.Area}
              options={AreaOptions}
              onChange={(value) => updateField('Area', value)}
              required={true}
              placeholder="Seleccionar área"
            />
          </Stack.Item>
          <Stack.Item grow={1}>
            <FormDropdown
              label="Proceso"
              selectedKey={formData.Process}
              options={ProcessOptions}
              onChange={(value) => updateField('Process', value)}
              placeholder="Seleccionar proceso"
            />
          </Stack.Item>
        </Stack>

        <Stack horizontal tokens={sectionTokens}>
          <Stack.Item grow={1}>
            <FormTextField
              label="Lugar de la NC"
              value={formData.PlaceOfNC}
              onChange={(value) => updateField('PlaceOfNC', value)}
              placeholder="Ubicación o lugar donde se detectó"
            />
          </Stack.Item>
          <Stack.Item grow={1}>
            <FormDatePicker
              label="Fecha de Registro"
              value={formData.ReportedDate}
              onChange={(date) => updateField('ReportedDate', date)}
            />
          </Stack.Item>
        </Stack>
      </Stack>

      {/* ── Descripción y Responsables ──────────────────────────────────────── */}
      <Separator>Descripción y Responsables</Separator>
      <Stack tokens={sectionTokens}>
        <FormTextField
          label="Descripción del Problema"
          value={formData.IssueDescription}
          onChange={(value) => updateField('IssueDescription', value)}
          multiline={true}
          rows={4}
          required={true}
          placeholder="Describa detalladamente la no conformidad detectada"
        />

        <Stack horizontal tokens={sectionTokens}>
          <Stack.Item grow={1}>
            <PeoplePicker
              context={props.context as any}
              titleText="Responsable Asignado"
              personSelectionLimit={1}
              showtooltip={true}
              required={false}
              disabled={loading}
              ensureUser={true}
              onChange={(items) => {
                if (items && items.length > 0) {
                  const item = items[0] as any;
                  updateField('AssignedTo', `${item.id}|${item.loginName}`);
                } else {
                  updateField('AssignedTo', '');
                }
              }}
              defaultSelectedUsers={
                formData.AssignedTo
                  ? [formData.AssignedTo.includes('|') ? formData.AssignedTo.split('|')[1] : formData.AssignedTo]
                  : []
              }
              principalTypes={[PrincipalType.User]}
              resolveDelay={300}
              webAbsoluteUrl={props.context.pageContext.web.absoluteUrl}
            />
          </Stack.Item>
          <Stack.Item grow={1}>
            <FormDatePicker
              label="Fecha Compromiso"
              value={formData.TargetResolutionDate}
              onChange={(date) => updateField('TargetResolutionDate', date)}
            />
          </Stack.Item>
        </Stack>
      </Stack>

      {/* ── Análisis de Causa Raíz ──────────────────────────────────────────── */}
      <Separator>Análisis de Causa Raíz</Separator>
      <Stack tokens={sectionTokens}>
        <FormTextField
          label="Causa y Efecto #1"
          value={formData.CauseAndEffectAnalysis1}
          onChange={(value) => updateField('CauseAndEffectAnalysis1', value)}
          multiline={true}
          rows={3}
          placeholder="Primera causa identificada"
        />
        <FormTextField
          label="Causa y Efecto #2"
          value={formData.CauseAndEffectAnalysis2}
          onChange={(value) => updateField('CauseAndEffectAnalysis2', value)}
          multiline={true}
          rows={2}
        />
        <FormTextField
          label="Causa y Efecto #3"
          value={formData.CauseAndEffectAnalysis3}
          onChange={(value) => updateField('CauseAndEffectAnalysis3', value)}
          multiline={true}
          rows={2}
        />
        <FormTextField
          label="Causa Raíz"
          value={formData.RootCause}
          onChange={(value) => updateField('RootCause', value)}
          multiline={true}
          rows={3}
          placeholder="Causa raíz determinada tras el análisis"
        />
      </Stack>

      {/* ── Cierre y Verificación (solo en edición cuando estado ≥ En ejecución) ── */}
      {isEditMode && (formData.Status === 'En ejecución' || formData.Status === 'Cerrada') && (
        <>
          <Separator>Cierre y Verificación</Separator>
          <Stack tokens={sectionTokens}>
            <FormTextField
              label="Resultado de Verificación"
              value={formData.VerificationResult}
              onChange={(value) => updateField('VerificationResult', value)}
              multiline={true}
              rows={3}
              placeholder="Resultado de la verificación de efectividad"
            />
            <Stack horizontal tokens={sectionTokens}>
              <Stack.Item grow={1}>
                <FormDatePicker
                  label="Fecha de Cierre"
                  value={formData.ClosureDate}
                  onChange={(date) => updateField('ClosureDate', date)}
                />
              </Stack.Item>
            </Stack>
          </Stack>
        </>
      )}

      {/* ── Comentarios ─────────────────────────────────────────────────────── */}
      <Separator>Comentarios</Separator>
      <FormTextField
        label="Comentarios adicionales"
        value={formData.Comments}
        onChange={(value) => updateField('Comments', value)}
        multiline={true}
        rows={3}
      />

      {/* ── Botones ─────────────────────────────────────────────────────────── */}
      <Stack horizontal tokens={sectionTokens} horizontalAlign="end" styles={{ root: { marginTop: 20 } }}>
        <DefaultButton
          text="Cancelar"
          onClick={() => props.onCancel && props.onCancel()}
          disabled={saving}
        />
        <PrimaryButton
          text={isEditMode ? 'Actualizar' : 'Registrar'}
          onClick={() => setShowConfirmDialog(true)}
          disabled={saving}
        />
      </Stack>

      {/* ── Diálogo de confirmación ──────────────────────────────────────────── */}
      <Dialog
        hidden={!showConfirmDialog}
        onDismiss={() => setShowConfirmDialog(false)}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Confirmar',
          subText: isEditMode
            ? '¿Desea guardar los cambios en esta No Conformidad?'
            : '¿Desea registrar esta nueva No Conformidad?'
        }}
      >
        <DialogFooter>
          <PrimaryButton onClick={() => { setShowConfirmDialog(false); handleSave(); }} text="Sí" />
          <DefaultButton onClick={() => setShowConfirmDialog(false)} text="No" />
        </DialogFooter>
      </Dialog>

      {saving && (
        <Stack horizontalAlign="center" styles={{ root: { padding: 20 } }}>
          <Spinner size={SpinnerSize.large} label="Guardando..." />
        </Stack>
      )}
    </Stack>
  );
};
