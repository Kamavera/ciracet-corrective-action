import * as React from 'react';
import {
  Stack,
  Text,
  Spinner,
  SpinnerSize,
  IStackTokens,
  Separator,
  Icon
} from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SharePointService } from '../services/SharePointService';
import { IHistoryItem } from '../models/ICorrectiveAction';

export interface IHistoryPanelProps {
  context: WebPartContext;
  /** SharePoint item ID of the NC whose history to show */
  ncId: number;
  /** Set to true to trigger a refresh (e.g. after saving) */
  refreshKey?: number;
}

const timelineTokens: IStackTokens = { childrenGap: 0 };
const entryTokens: IStackTokens = { childrenGap: 4 };

/** Formats a Date as "dd/MM/yyyy HH:mm" in local time */
const formatDate = (date: Date | null): string => {
  if (!date) return '—';
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const dotStyle: React.CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: '#0078d4',
  flexShrink: 0,
  marginTop: 4
};

const lineStyle: React.CSSProperties = {
  width: 2,
  backgroundColor: '#e1dfdd',
  flexShrink: 0,
  margin: '0 5px'
};

export const HistoryPanel: React.FC<IHistoryPanelProps> = (props) => {
  const [entries, setEntries] = React.useState<IHistoryItem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const spService = React.useMemo(() => new SharePointService(props.context), [props.context]);

  React.useEffect(() => {
    if (props.ncId) {
      loadHistory();
    }
  }, [props.ncId, props.refreshKey]);

  const loadHistory = async (): Promise<void> => {
    setLoading(true);
    try {
      const items = await spService.getHistoryForNC(props.ncId);
      setEntries(items);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Stack horizontalAlign="center" styles={{ root: { padding: 16 } }}>
        <Spinner size={SpinnerSize.small} label="Cargando historial..." />
      </Stack>
    );
  }

  if (entries.length === 0) {
    return (
      <Stack styles={{ root: { padding: '8px 0' } }}>
        <Text styles={{ root: { color: '#605e5c', fontStyle: 'italic' } }}>
          Sin entradas de historial aún.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack tokens={timelineTokens} styles={{ root: { paddingTop: 8 } }}>
      {entries.map((entry, index) => (
        <Stack key={entry.Id || index} horizontal tokens={{ childrenGap: 0 }}>
          {/* Timeline rail */}
          <Stack horizontalAlign="center" styles={{ root: { width: 22, flexShrink: 0 } }}>
            <div style={dotStyle} />
            {index < entries.length - 1 && (
              <div style={{ ...lineStyle, flexGrow: 1, minHeight: 20 }} />
            )}
          </Stack>

          {/* Entry content */}
          <Stack
            tokens={entryTokens}
            styles={{
              root: {
                flex: 1,
                padding: '4px 0 20px 12px'
              }
            }}
          >
            <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
              <Text styles={{ root: { fontWeight: 600, color: '#323130' } }}>
                {entry.Change}
              </Text>
            </Stack>
            <Stack horizontal tokens={{ childrenGap: 16 }}>
              <Stack horizontal tokens={{ childrenGap: 4 }} verticalAlign="center">
                <Icon iconName="Contact" styles={{ root: { fontSize: 12, color: '#605e5c' } }} />
                <Text variant="small" styles={{ root: { color: '#605e5c' } }}>
                  {entry.User || 'Usuario desconocido'}
                </Text>
              </Stack>
              <Stack horizontal tokens={{ childrenGap: 4 }} verticalAlign="center">
                <Icon iconName="Clock" styles={{ root: { fontSize: 12, color: '#605e5c' } }} />
                <Text variant="small" styles={{ root: { color: '#605e5c' } }}>
                  {formatDate(entry.Date)}
                </Text>
              </Stack>
            </Stack>
            {entry.Comments && (
              <Text variant="small" styles={{ root: { color: '#605e5c', fontStyle: 'italic' } }}>
                {entry.Comments}
              </Text>
            )}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};
