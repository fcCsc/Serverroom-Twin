import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration, PropertyPaneCheckbox, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'ServerRoomDigitalTwinWebPartStrings';
import ServerRoomDigitalTwin from './components/ServerRoomDigitalTwin';
import { IServerRoomDigitalTwinProps } from './components/IServerRoomDigitalTwinProps';

export interface IServerRoomDigitalTwinWebPartProps {
  description: string;
  racksListName: string;
  devicesListName: string;
  useDummyData: boolean;
}

export default class ServerRoomDigitalTwinWebPart extends BaseClientSideWebPart<IServerRoomDigitalTwinWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IServerRoomDigitalTwinProps> = React.createElement(ServerRoomDigitalTwin, {
      description: this.properties.description,
      racksListName: this.properties.racksListName || 'Racks',
      devicesListName: this.properties.devicesListName || 'Devices',
      useDummyData: this.properties.useDummyData !== false
    });
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void { ReactDom.unmountComponentAtNode(this.domElement); }
  protected get dataVersion(): Version { return Version.parse('1.0'); }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ header: { description: strings.PropertyPaneDescription }, groups: [{ groupName: strings.BasicGroupName, groupFields: [
      PropertyPaneTextField('description', { label: strings.DescriptionFieldLabel }),
      PropertyPaneTextField('racksListName', { label: 'Racks list name' }),
      PropertyPaneTextField('devicesListName', { label: 'Devices list name' }),
      PropertyPaneCheckbox('useDummyData', { text: 'Use dummy data fallback' })
    ] }] }] };
  }
}
