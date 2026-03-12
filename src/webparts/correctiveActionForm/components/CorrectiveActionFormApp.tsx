import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { Dashboard } from './Dashboard';
import { CorrectiveActionForm } from './CorrectiveActionForm';
import { Stack } from '@fluentui/react';

export interface ICorrectiveActionFormAppProps {
  context: WebPartContext;
  title?: string;
  defaultView?: string;
  itemId?: number;
  showDashboard?: boolean;
}

type ViewMode = 'dashboard' | 'form' | 'edit';

export const CorrectiveActionFormApp: React.FC<ICorrectiveActionFormAppProps> = (props) => {
  const [currentView, setCurrentView] = React.useState<ViewMode>('dashboard');
  const [editItemId, setEditItemId] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    // Initialize view based on props
    if (props.itemId) {
      // Direct link to edit specific item
      setEditItemId(props.itemId);
      setCurrentView('edit');
    } else if (props.defaultView === 'form') {
      // Show form for new item
      setCurrentView('form');
    } else if (props.showDashboard !== false) {
      // Default to dashboard
      setCurrentView('dashboard');
    } else {
      // Show form if dashboard is disabled
      setCurrentView('form');
    }
  }, [props.itemId, props.defaultView, props.showDashboard]);

  const handleNewItem = (): void => {
    setEditItemId(undefined);
    setCurrentView('form');
  };

  const handleEditItem = (itemId: number): void => {
    setEditItemId(itemId);
    setCurrentView('edit');
  };

  const handleSave = (): void => {
    // Return to dashboard after save
    setCurrentView('dashboard');
    setEditItemId(undefined);
  };

  const handleCancel = (): void => {
    // Return to dashboard on cancel
    if (props.showDashboard !== false) {
      setCurrentView('dashboard');
    }
    setEditItemId(undefined);
  };

  return (
    <Stack>
      {currentView === 'dashboard' && (
        <Dashboard
          context={props.context}
          onNew={handleNewItem}
          onEdit={handleEditItem}
        />
      )}

      {currentView === 'form' && (
        <CorrectiveActionForm
          context={props.context}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {currentView === 'edit' && editItemId && (
        <CorrectiveActionForm
          context={props.context}
          itemId={editItemId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </Stack>
  );
};
