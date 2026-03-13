import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { Dashboard } from './Dashboard';
import { CorrectiveActionForm } from './CorrectiveActionForm';
import { NonConformityForm } from './NonConformityForm';
import { Stack } from '@fluentui/react';

export interface ICorrectiveActionFormAppProps {
  context: WebPartContext;
  title?: string;
  defaultView?: string;
  itemId?: number;
  showDashboard?: boolean;
}

type ViewMode = 'dashboard' | 'form' | 'edit' | 'nc-form' | 'nc-edit';

export const CorrectiveActionFormApp: React.FC<ICorrectiveActionFormAppProps> = (props) => {
  const [currentView, setCurrentView] = React.useState<ViewMode>('dashboard');
  const [editItemId, setEditItemId] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (props.itemId) {
      setEditItemId(props.itemId);
      setCurrentView('edit');
    } else if (props.defaultView === 'form') {
      setCurrentView('form');
    } else if (props.defaultView === 'nc-form') {
      setCurrentView('nc-form');
    } else if (props.showDashboard !== false) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('dashboard');
    }
  }, [props.itemId, props.defaultView, props.showDashboard]);

  // ── Corrective Action navigation ─────────────────────────────────────────
  const handleNewCA = (): void => {
    setEditItemId(undefined);
    setCurrentView('form');
  };

  const handleEditCA = (itemId: number): void => {
    setEditItemId(itemId);
    setCurrentView('edit');
  };

  // ── Non Conformity navigation ─────────────────────────────────────────────
  const handleNewNC = (): void => {
    setEditItemId(undefined);
    setCurrentView('nc-form');
  };

  const handleEditNC = (itemId: number): void => {
    setEditItemId(itemId);
    setCurrentView('nc-edit');
  };

  // ── Shared navigation ─────────────────────────────────────────────────────
  const handleSave = (): void => {
    setCurrentView('dashboard');
    setEditItemId(undefined);
  };

  const handleCancel = (): void => {
    setCurrentView('dashboard');
    setEditItemId(undefined);
  };

  return (
    <Stack>
      {/* Dashboard — main list view for both NC and CA */}
      {currentView === 'dashboard' && (
        <Dashboard
          context={props.context}
          onNewCA={handleNewCA}
          onEditCA={handleEditCA}
          onNewNC={handleNewNC}
          onEditNC={handleEditNC}
        />
      )}

      {/* Corrective Action — create */}
      {currentView === 'form' && (
        <CorrectiveActionForm
          context={props.context}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Corrective Action — edit */}
      {currentView === 'edit' && editItemId && (
        <CorrectiveActionForm
          context={props.context}
          itemId={editItemId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Non Conformity — create */}
      {currentView === 'nc-form' && (
        <NonConformityForm
          context={props.context}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Non Conformity — edit */}
      {currentView === 'nc-edit' && editItemId && (
        <NonConformityForm
          context={props.context}
          itemId={editItemId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </Stack>
  );
};
