import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  Stack,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  IStackTokens,
  SearchBox,
  CommandBar,
  ICommandBarItemProps
} from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SharePointService } from '../services/SharePointService';
import { ICorrectiveAction } from '../models/ICorrectiveAction';

export interface IDashboardProps {
  context: WebPartContext;
  onEdit: (itemId: number) => void;
  onNew: () => void;
}

const stackTokens: IStackTokens = { childrenGap: 15 };

export const Dashboard: React.FC<IDashboardProps> = (props) => {
  const [items, setItems] = React.useState<ICorrectiveAction[]>([]);
  const [filteredItems, setFilteredItems] = React.useState<ICorrectiveAction[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>('');
  const [searchText, setSearchText] = React.useState<string>('');

  const spService = React.useMemo(() => new SharePointService(props.context), [props.context]);

  React.useEffect(() => {
    loadData();
  }, []);

  React.useEffect(() => {
    filterItems();
  }, [searchText, items]);

  const loadData = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const data = await spService.getMyCorrectiveActions();
      setItems(data);
      setFilteredItems(data);
    } catch (err) {
      setError(err.message || 'Failed to load Corrective Actions');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = (): void => {
    if (!searchText) {
      setFilteredItems(items);
      return;
    }

    const searchLower = searchText.toLowerCase();
    const filtered = items.filter(item =>
      item.Title?.toLowerCase().includes(searchLower) ||
      item.Status?.toLowerCase().includes(searchLower) ||
      item.ReferenceID?.toLowerCase().includes(searchLower) ||
      item.NCReportNumber?.toLowerCase().includes(searchLower)
    );

    setFilteredItems(filtered);
  };

  const columns: IColumn[] = [
    {
      key: 'title',
      name: 'Title',
      fieldName: 'Title',
      minWidth: 150,
      maxWidth: 250,
      isResizable: true,
      onRender: (item: ICorrectiveAction) => {
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (item.Id) {
                props.onEdit(item.Id);
              }
            }}
            style={{ textDecoration: 'underline', color: '#0078d4' }}
          >
            {item.Title}
          </a>
        );
      }
    },
    {
      key: 'status',
      name: 'Status',
      fieldName: 'Status',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: ICorrectiveAction) => {
        const statusColors: { [key: string]: string } = {
          'Not Started': '#8a8886',
          'In Progress': '#ffaa44',
          'Completed': '#107c10',
          'Overdue': '#d13438'
        };

        return (
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: statusColors[item.Status] || '#605e5c',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            {item.Status}
          </span>
        );
      }
    },
    {
      key: 'referenceId',
      name: 'Reference ID',
      fieldName: 'ReferenceID',
      minWidth: 120,
      maxWidth: 150,
      isResizable: true
    },
    {
      key: 'ncReportNumber',
      name: 'NC Report Number',
      fieldName: 'NCReportNumber',
      minWidth: 120,
      maxWidth: 150,
      isResizable: true
    },
    {
      key: 'responsiblePerson',
      name: 'Responsible Person',
      fieldName: 'ResponsiblePerson',
      minWidth: 120,
      maxWidth: 180,
      isResizable: true
    },
    {
      key: 'dueDate',
      name: 'Due Date',
      fieldName: 'DueDate',
      minWidth: 100,
      maxWidth: 120,
      isResizable: true,
      onRender: (item: ICorrectiveAction) => {
        if (!item.DueDate) return '-';

        const dueDate = new Date(item.DueDate);
        const today = new Date();
        const isOverdue = dueDate < today && item.Status !== 'Completed';

        return (
          <span style={{ color: isOverdue ? '#d13438' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
            {dueDate.toLocaleDateString()}
          </span>
        );
      }
    },
    {
      key: 'capaStatus',
      name: 'CAPA Status',
      fieldName: 'CAPAStatus',
      minWidth: 100,
      maxWidth: 120,
      isResizable: true
    }
  ];

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'new',
      text: 'New Corrective Action',
      iconProps: { iconName: 'Add' },
      onClick: props.onNew
    },
    {
      key: 'refresh',
      text: 'Refresh',
      iconProps: { iconName: 'Refresh' },
      onClick: loadData
    }
  ];

  if (loading) {
    return (
      <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { padding: 50 } }}>
        <Spinner size={SpinnerSize.large} label="Loading Corrective Actions..." />
      </Stack>
    );
  }

  return (
    <Stack tokens={stackTokens} styles={{ root: { padding: 20 } }}>
      {/* Header */}
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <h2>My Corrective Actions</h2>
      </Stack>

      {/* Error Message */}
      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError('')}>
          {error}
        </MessageBar>
      )}

      {/* Command Bar */}
      <CommandBar items={commandBarItems} />

      {/* Search Box */}
      <SearchBox
        placeholder="Search by Title, Status, Reference ID, or NC Report Number"
        value={searchText}
        onChange={(_, newValue) => setSearchText(newValue || '')}
        onClear={() => setSearchText('')}
      />

      {/* List */}
      {filteredItems.length === 0 ? (
        <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { padding: 40 } }}>
          <MessageBar messageBarType={MessageBarType.info}>
            {searchText
              ? 'No Corrective Actions found matching your search.'
              : 'You have not created any Corrective Actions yet. Click "New Corrective Action" to get started.'}
          </MessageBar>
          {!searchText && (
            <PrimaryButton
              text="Create New Corrective Action"
              iconProps={{ iconName: 'Add' }}
              onClick={props.onNew}
              styles={{ root: { marginTop: 20 } }}
            />
          )}
        </Stack>
      ) : (
        <>
          <DetailsList
            items={filteredItems}
            columns={columns}
            selectionMode={SelectionMode.none}
            layoutMode={DetailsListLayoutMode.justified}
            isHeaderVisible={true}
          />

          <Stack horizontal horizontalAlign="space-between" styles={{ root: { marginTop: 10 } }}>
            <span style={{ fontSize: 12, color: '#605e5c' }}>
              Showing {filteredItems.length} of {items.length} items
            </span>
          </Stack>
        </>
      )}
    </Stack>
  );
};
