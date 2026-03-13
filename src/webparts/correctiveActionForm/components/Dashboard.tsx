import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  Stack,
  PrimaryButton,
  DefaultButton,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  IStackTokens,
  SearchBox,
  CommandBar,
  ICommandBarItemProps,
  Pivot,
  PivotItem,
  Toggle,
  Dropdown,
  IDropdownOption,
  IDropdownStyles,
  Label
} from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SharePointService } from '../services/SharePointService';
import {
  ICorrectiveAction,
  INonConformity,
  NCStatusOptions,
  CAPAStatusOptions,
  SeverityOptions
} from '../models/ICorrectiveAction';

export interface IDashboardProps {
  context: WebPartContext;
  onNewCA: () => void;
  onEditCA: (itemId: number) => void;
  onNewNC: () => void;
  onEditNC: (itemId: number) => void;
}

// ── Layout constants ──────────────────────────────────────────────────────────
const stackTokens: IStackTokens = { childrenGap: 15 };
const filterTokens: IStackTokens = { childrenGap: 10 };

const dropdownStyles: Partial<IDropdownStyles> = { root: { minWidth: 140 } };

const statusColors: Record<string, string> = {
  // NC Status (real SP values)
  'Not Started': '#d13438',
  'In progress': '#ffaa44',
  'Completed':   '#107c10',
  'Overdue':     '#a4262c',
  // CA CAPA Status (real SP values)
  'Open':        '#d13438',
  'In Process':  '#0078d4',
  'Closed':      '#107c10'
};

/** Translate real SP choice values to Spanish UI labels */
const statusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'Not Started': 'No iniciada',
    'In progress': 'En progreso',
    'Completed':   'Completada',
    'Overdue':     'Vencida',
    'Open':        'Abierta',
    'In Process':  'En proceso',
    'Closed':      'Cerrada'
  };
  return labels[status] || status;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span style={{
    padding: '3px 8px',
    borderRadius: 4,
    backgroundColor: statusColors[status] || '#605e5c',
    color: 'white',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap'
  }}>
    {statusLabel(status)}
  </span>
);

const KpiCard: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
  <Stack
    horizontalAlign="center"
    verticalAlign="center"
    styles={{
      root: {
        background: '#fff',
        border: `2px solid ${color || '#0078d4'}`,
        borderRadius: 8,
        padding: '16px 24px',
        minWidth: 130,
        flex: 1
      }
    }}
  >
    <span style={{ fontSize: 28, fontWeight: 700, color: color || '#0078d4', lineHeight: 1 }}>
      {value}
    </span>
    <span style={{ fontSize: 12, color: '#605e5c', marginTop: 4, textAlign: 'center' }}>
      {label}
    </span>
  </Stack>
);

// ── Component ─────────────────────────────────────────────────────────────────
export const Dashboard: React.FC<IDashboardProps> = (props) => {
  // NC state
  const [ncItems, setNcItems] = React.useState<INonConformity[]>([]);
  const [filteredNC, setFilteredNC] = React.useState<INonConformity[]>([]);

  // CA state
  const [caItems, setCaItems] = React.useState<ICorrectiveAction[]>([]);
  const [filteredCA, setFilteredCA] = React.useState<ICorrectiveAction[]>([]);

  // UI state
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>('');
  const [activeTab, setActiveTab] = React.useState<string>('nc');
  const [showAll, setShowAll] = React.useState<boolean>(false);
  const [searchText, setSearchText] = React.useState<string>('');
  const [filterStatus, setFilterStatus] = React.useState<string>('');
  const [filterSeverity, setFilterSeverity] = React.useState<string>('');
  const [filterArea, setFilterArea] = React.useState<string>('');

  const spService = React.useMemo(() => new SharePointService(props.context), [props.context]);

  React.useEffect(() => {
    loadData();
  }, [showAll]);

  React.useEffect(() => {
    applyFilters();
  }, [searchText, filterStatus, filterSeverity, filterArea, ncItems, caItems]);

  // ── Data loading ────────────────────────────────────────────────────────────
  const loadData = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const [nc, ca] = await Promise.all([
        spService.getAllNonConformities(),
        showAll ? spService.getAllCorrectiveActions() : spService.getMyCorrectiveActions()
      ]);
      setNcItems(nc);
      setCaItems(ca);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // ── Filtering ───────────────────────────────────────────────────────────────
  const applyFilters = (): void => {
    const q = searchText.toLowerCase();

    setFilteredNC(ncItems.filter(item => {
      const matchesSearch = !q
        || (item.Title || '').toLowerCase().includes(q)
        || (item.ReferenceID || '').toLowerCase().includes(q)
        || (item.Area || '').toLowerCase().includes(q);
      const matchesStatus   = !filterStatus   || item.Status   === filterStatus;
      const matchesSeverity = !filterSeverity || item.Severity === filterSeverity;
      const matchesArea     = !filterArea     || item.Area     === filterArea;
      return matchesSearch && matchesStatus && matchesSeverity && matchesArea;
    }));

    setFilteredCA(caItems.filter(item => {
      const matchesSearch = !q
        || (item.Title || '').toLowerCase().includes(q)
        || (item.ReferenceID || '').toLowerCase().includes(q)
        || (item.NCReportNumber || '').toLowerCase().includes(q);
      const matchesStatus = !filterStatus || item.CAPAStatus === filterStatus;
      return matchesSearch && matchesStatus;
    }));
  };

  const clearFilters = (): void => {
    setSearchText('');
    setFilterStatus('');
    setFilterSeverity('');
    setFilterArea('');
  };

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const ncKpis = React.useMemo(() => {
    const total    = ncItems.length;
    const open     = ncItems.filter(n => n.Status === 'Not Started').length;
    const analysis = ncItems.filter(n => n.Status === 'In progress').length;
    const closed   = ncItems.filter(n => n.Status === 'Completed').length;

    const closedWithDates = ncItems.filter(n =>
      n.Status === 'Completed' && n.TargetResolutionDate && n.ClosureDate
    );
    const onTime = closedWithDates.length > 0
      ? Math.round(
          closedWithDates.filter(n => n.ClosureDate <= n.TargetResolutionDate).length
          / closedWithDates.length * 100
        )
      : 0;

    return { total, open, analysis, closed, onTime };
  }, [ncItems]);

  // ── NC columns ──────────────────────────────────────────────────────────────
  const ncColumns: IColumn[] = [
    {
      key: 'ref',
      name: 'Referencia',
      fieldName: 'ReferenceID',
      minWidth: 100,
      maxWidth: 130,
      isResizable: true,
      onRender: (item: INonConformity) => (
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); if (item.Id) props.onEditNC(item.Id); }}
          style={{ color: '#0078d4', textDecoration: 'underline', fontWeight: 600 }}
        >
          {item.ReferenceID || `NC-${item.Id}`}
        </a>
      )
    },
    {
      key: 'title',
      name: 'Título',
      fieldName: 'Title',
      minWidth: 180,
      maxWidth: 300,
      isResizable: true
    },
    {
      key: 'status',
      name: 'Estado',
      fieldName: 'Status',
      minWidth: 110,
      maxWidth: 130,
      isResizable: true,
      onRender: (item: INonConformity) => <StatusBadge status={item.Status} />
    },
    {
      key: 'severity',
      name: 'Severidad',
      fieldName: 'Severity',
      minWidth: 80,
      maxWidth: 100,
      isResizable: true
    },
    {
      key: 'area',
      name: 'Área',
      fieldName: 'Area',
      minWidth: 100,
      maxWidth: 140,
      isResizable: true
    },
    {
      key: 'process',
      name: 'Proceso',
      fieldName: 'Process',
      minWidth: 120,
      maxWidth: 180,
      isResizable: true
    },
    {
      key: 'target',
      name: 'Fecha Compromiso',
      fieldName: 'TargetResolutionDate',
      minWidth: 110,
      maxWidth: 130,
      isResizable: true,
      onRender: (item: INonConformity) => {
        if (!item.TargetResolutionDate) return '-';
        const d = new Date(item.TargetResolutionDate);
        const overdue = d < new Date() && item.Status !== 'Completed';
        return (
          <span style={{ color: overdue ? '#d13438' : 'inherit', fontWeight: overdue ? 600 : 400 }}>
            {d.toLocaleDateString('es-PR')}
          </span>
        );
      }
    }
  ];

  // ── CA columns ───────────────────────────────────────────────────────────────
  const caColumns: IColumn[] = [
    {
      key: 'ref',
      name: 'Referencia AC',
      fieldName: 'ReferenceID',
      minWidth: 110,
      maxWidth: 140,
      isResizable: true,
      onRender: (item: ICorrectiveAction) => (
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); if (item.Id) props.onEditCA(item.Id); }}
          style={{ color: '#0078d4', textDecoration: 'underline', fontWeight: 600 }}
        >
          {item.ReferenceID || `AC-${item.Id}`}
        </a>
      )
    },
    {
      key: 'nc',
      name: 'NC Relacionada',
      fieldName: 'NCReportNumber',
      minWidth: 110,
      maxWidth: 140,
      isResizable: true
    },
    {
      key: 'title',
      name: 'Título',
      fieldName: 'Title',
      minWidth: 180,
      maxWidth: 300,
      isResizable: true
    },
    {
      key: 'capaStatus',
      name: 'Estado',
      fieldName: 'CAPAStatus',
      minWidth: 100,
      maxWidth: 120,
      isResizable: true,
      onRender: (item: ICorrectiveAction) => <StatusBadge status={item.CAPAStatus} />
    },
    {
      key: 'dueDate',
      name: 'Fecha Límite',
      fieldName: 'DueDate',
      minWidth: 100,
      maxWidth: 120,
      isResizable: true,
      onRender: (item: ICorrectiveAction) => {
        if (!item.DueDate) return '-';
        const d = new Date(item.DueDate);
        const overdue = d < new Date() && item.CAPAStatus !== 'Closed';
        return (
          <span style={{ color: overdue ? '#d13438' : 'inherit', fontWeight: overdue ? 600 : 400 }}>
            {d.toLocaleDateString('es-PR')}
          </span>
        );
      }
    }
  ];

  // ── Command bars ─────────────────────────────────────────────────────────────
  const ncCommandBarItems: ICommandBarItemProps[] = [
    {
      key: 'newNC',
      text: 'Nueva NC',
      iconProps: { iconName: 'Add' },
      onClick: props.onNewNC
    },
    {
      key: 'refresh',
      text: 'Actualizar',
      iconProps: { iconName: 'Refresh' },
      onClick: loadData
    }
  ];

  const caCommandBarItems: ICommandBarItemProps[] = [
    {
      key: 'newCA',
      text: 'Nueva Acción Correctiva',
      iconProps: { iconName: 'Add' },
      onClick: props.onNewCA
    },
    {
      key: 'refresh',
      text: 'Actualizar',
      iconProps: { iconName: 'Refresh' },
      onClick: loadData
    }
  ];

  if (loading) {
    return (
      <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { padding: 50 } }}>
        <Spinner size={SpinnerSize.large} label="Cargando portal..." />
      </Stack>
    );
  }

  return (
    <Stack tokens={stackTokens} styles={{ root: { padding: 20 } }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <h2 style={{ margin: 0 }}>Portal de Gestión — No Conformidades y Acciones Correctivas</h2>
        <Toggle
          label="Ver todos los registros"
          inlineLabel
          checked={showAll}
          onChange={(_, checked) => setShowAll(!!checked)}
        />
      </Stack>

      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError('')}>
          {error}
        </MessageBar>
      )}

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <Stack horizontal tokens={{ childrenGap: 12 }} wrap>
        <KpiCard label="Total NC"          value={ncKpis.total}    color="#605e5c" />
        <KpiCard label="Abiertas"          value={ncKpis.open}     color="#d13438" />
        <KpiCard label="En Análisis"       value={ncKpis.analysis} color="#ffaa44" />
        <KpiCard label="Cerradas"          value={ncKpis.closed}   color="#107c10" />
        <KpiCard label="% Resueltas a tiempo" value={`${ncKpis.onTime}%`} color="#0078d4" />
        <KpiCard label="Acciones Correctivas" value={caItems.length} color="#8764b8" />
      </Stack>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <Stack horizontal tokens={filterTokens} verticalAlign="end" wrap>
        <SearchBox
          placeholder="Buscar por título, referencia o área..."
          value={searchText}
          onChange={(_, v) => setSearchText(v || '')}
          onClear={() => setSearchText('')}
          styles={{ root: { width: 280 } }}
        />
        <Dropdown
          placeholder="Estado"
          selectedKey={filterStatus || undefined}
          options={[{ key: '', text: 'Todos los estados' }, ...NCStatusOptions]}
          styles={dropdownStyles}
          onChange={(_, opt) => setFilterStatus(opt ? String(opt.key) : '')}
        />
        {activeTab === 'nc' && (
          <>
            <Dropdown
              placeholder="Severidad"
              selectedKey={filterSeverity || undefined}
              options={[{ key: '', text: 'Todas las severidades' }, ...SeverityOptions]}
              styles={dropdownStyles}
              onChange={(_, opt) => setFilterSeverity(opt ? String(opt.key) : '')}
            />
          </>
        )}
        {(searchText || filterStatus || filterSeverity || filterArea) && (
          <DefaultButton text="Limpiar filtros" onClick={clearFilters} iconProps={{ iconName: 'Clear' }} />
        )}
      </Stack>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <Pivot
        selectedKey={activeTab}
        onLinkClick={(item) => { if (item) setActiveTab(item.props.itemKey || 'nc'); }}
      >
        {/* No Conformidades */}
        <PivotItem
          headerText={`No Conformidades (${filteredNC.length})`}
          itemKey="nc"
        >
          <Stack tokens={{ childrenGap: 10 }} styles={{ root: { paddingTop: 10 } }}>
            <CommandBar items={ncCommandBarItems} />
            {filteredNC.length === 0 ? (
              <MessageBar messageBarType={MessageBarType.info}>
                {searchText || filterStatus || filterSeverity || filterArea
                  ? 'No se encontraron No Conformidades con los filtros aplicados.'
                  : 'No hay No Conformidades registradas. Haz clic en "Nueva NC" para comenzar.'}
              </MessageBar>
            ) : (
              <>
                <DetailsList
                  items={filteredNC}
                  columns={ncColumns}
                  selectionMode={SelectionMode.none}
                  layoutMode={DetailsListLayoutMode.justified}
                  isHeaderVisible={true}
                />
                <span style={{ fontSize: 12, color: '#605e5c' }}>
                  Mostrando {filteredNC.length} de {ncItems.length} registros
                </span>
              </>
            )}
          </Stack>
        </PivotItem>

        {/* Acciones Correctivas */}
        <PivotItem
          headerText={`Acciones Correctivas (${filteredCA.length})`}
          itemKey="ca"
        >
          <Stack tokens={{ childrenGap: 10 }} styles={{ root: { paddingTop: 10 } }}>
            <CommandBar items={caCommandBarItems} />
            {filteredCA.length === 0 ? (
              <MessageBar messageBarType={MessageBarType.info}>
                {searchText || filterStatus
                  ? 'No se encontraron Acciones Correctivas con los filtros aplicados.'
                  : 'No hay Acciones Correctivas. Haz clic en "Nueva Acción Correctiva" para comenzar.'}
              </MessageBar>
            ) : (
              <>
                <DetailsList
                  items={filteredCA}
                  columns={caColumns}
                  selectionMode={SelectionMode.none}
                  layoutMode={DetailsListLayoutMode.justified}
                  isHeaderVisible={true}
                />
                <span style={{ fontSize: 12, color: '#605e5c' }}>
                  Mostrando {filteredCA.length} de {caItems.length} registros
                </span>
              </>
            )}
          </Stack>
        </PivotItem>
      </Pivot>
    </Stack>
  );
};
