import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { CorrectiveActionFormApp } from './components/CorrectiveActionFormApp';

export interface ICorrectiveActionFormWebPartProps {
  title: string;
  defaultView: string;
  itemId?: number;
  showDashboard: boolean;
}

export default class CorrectiveActionFormWebPart extends BaseClientSideWebPart<ICorrectiveActionFormWebPartProps> {
  public render(): void {
    const element: React.ReactElement = React.createElement(
      CorrectiveActionFormApp,
      {
        context: this.context,
        title: this.properties.title,
        defaultView: this.properties.defaultView,
        itemId: this.properties.itemId,
        showDashboard: this.properties.showDashboard
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: 'Configure the Corrective Action Form web part'
          },
          groups: [
            {
              groupName: 'General Settings',
              groupFields: [
                PropertyPaneTextField('title', {
                  label: 'Web Part Title',
                  value: 'Corrective Actions'
                }),
                PropertyPaneToggle('showDashboard', {
                  label: 'Show Dashboard View',
                  onText: 'Dashboard',
                  offText: 'Form Only',
                  checked: true
                }),
                PropertyPaneDropdown('defaultView', {
                  label: 'Default View',
                  options: [
                    { key: 'dashboard', text: 'Dashboard' },
                    { key: 'form', text: 'Form' }
                  ],
                  selectedKey: 'dashboard'
                }),
                PropertyPaneTextField('itemId', {
                  label: 'Item ID (for direct edit)',
                  description: 'Leave empty for new items or dashboard view'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
