import { IAppConfiguration, IDataProviderResult, IDevice, IListDiscoveryResult, IRack, MountWidth, RackSide } from '../models/ServerRoomModels';
import { IDataProvider, IListDiscoveryService } from './IDataProvider';

type SpHttpClientLike = {
  get: (url: string, configuration: unknown) => Promise<{ ok: boolean; json: () => Promise<unknown>; statusText?: string }>;
  post?: (url: string, configuration: unknown, options: unknown) => Promise<{ ok: boolean; json: () => Promise<unknown>; statusText?: string }>;
};

const spConfig = { v1: {} };
const textValue = (item: Record<string, unknown>, column: string | undefined, fallback = ''): string => {
  if (!column) return fallback;
  const value = item[column];
  return value === undefined || value === null ? fallback : String(value);
};
const numberValue = (item: Record<string, unknown>, column: string | undefined, fallback: number): number => {
  const raw = textValue(item, column, '');
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const choiceValue = <T extends string>(item: Record<string, unknown>, column: string | undefined, allowed: T[], fallback: T): T => {
  const value = textValue(item, column, fallback) as T;
  return allowed.indexOf(value) > -1 ? value : fallback;
};

export class SharePointListDataProvider implements IDataProvider {
  public constructor(private readonly spHttpClient: SpHttpClientLike | undefined, private readonly siteUrl: string | undefined) {}

  public async loadData(config: IAppConfiguration): Promise<IDataProviderResult> {
    if (!this.spHttpClient || !this.siteUrl) throw new Error('SharePoint context is not available.');
    const rackItems = await this.getListItems(config.racksListName);
    const deviceItems = await this.getListItems(config.devicesListName);
    const rackMap = config.columnMappings.racks;
    const deviceMap = config.columnMappings.devices;

    const racks: IRack[] = rackItems.map((item) => ({
      RackKey: textValue(item, rackMap.RackKey),
      Location: textValue(item, rackMap.Location),
      Room: textValue(item, rackMap.Floor),
      Floor: textValue(item, rackMap.Floor),
      RackHeightU: numberValue(item, rackMap.RackHeightU, 42),
      Responsible: textValue(item, rackMap.Responsible),
      Occupancy: textValue(item, rackMap.Occupancy),
      Notes: textValue(item, rackMap.Notes, '')
    })).filter((rack) => rack.RackKey.length > 0);

    const devices: IDevice[] = deviceItems.map((item) => ({
      DeviceKey: textValue(item, deviceMap.DeviceKey),
      DeviceName: textValue(item, deviceMap.DeviceName, textValue(item, deviceMap.DeviceKey)),
      RackKey: textValue(item, deviceMap.RackKey),
      UPosition: numberValue(item, deviceMap.UPosition, 1),
      UHeight: numberValue(item, deviceMap.UHeight, config.defaultUHeight),
      DeviceType: choiceValue(item, deviceMap.DeviceType, ['Server', 'Switch', 'Storage', 'Firewall', 'PatchPanel', 'UPS', 'Appliance'], 'Appliance'),
      IPAddress: textValue(item, deviceMap.IPAddress, ''),
      VLAN: textValue(item, deviceMap.VLAN, ''),
      PowerConsumptionW: numberValue(item, deviceMap.PowerConsumptionW, 0),
      SerialNumber: textValue(item, deviceMap.SerialNumber, ''),
      WarrantyExpiry: textValue(item, deviceMap.WarrantyExpiry, ''),
      MaintenanceResponsible: textValue(item, deviceMap.MaintenanceResponsible, ''),
      Manufacturer: textValue(item, deviceMap.Manufacturer, ''),
      Model: textValue(item, deviceMap.Model, ''),
      AssetTag: textValue(item, deviceMap.AssetTag, ''),
      RackSide: choiceValue<RackSide>(item, deviceMap.RackSide, ['Front', 'Rear'], config.defaultRackSide),
      MountWidth: choiceValue<MountWidth>(item, deviceMap.MountWidth, ['Full', 'Half', 'Third', 'Quarter'], config.defaultMountWidth),
      HorizontalSlot: numberValue(item, deviceMap.HorizontalSlot, 1),
      Notes: textValue(item, deviceMap.Notes, '')
    })).filter((device) => device.DeviceKey.length > 0 && device.RackKey.length > 0);

    return { racks, devices };
  }

  private async getListItems(listName: string): Promise<Array<Record<string, unknown>>> {
    const url = `${this.siteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(listName).replace(/'/g, "''")}')/items?$top=5000`;
    const response = await this.spHttpClient!.get(url, spConfig.v1);
    if (!response.ok) throw new Error(`Unable to load SharePoint list ${listName}: ${response.statusText || 'request failed'}`);
    const json = await response.json() as { value?: Array<Record<string, unknown>> };
    return json.value || [];
  }
}

export class SharePointListDiscoveryService implements IListDiscoveryService {
  public constructor(private readonly spHttpClient: SpHttpClientLike | undefined, private readonly siteUrl: string | undefined) {}

  public async discover(): Promise<IListDiscoveryResult> {
    if (!this.spHttpClient || !this.siteUrl) throw new Error('SharePoint context is not available.');
    const listResponse = await this.spHttpClient.get(`${this.siteUrl}/_api/web/lists?$select=Title,Hidden&$filter=Hidden eq false`, spConfig.v1);
    if (!listResponse.ok) throw new Error('Unable to discover SharePoint lists.');
    const listJson = await listResponse.json() as { value?: Array<{ Title: string }> };
    const lists = await Promise.all((listJson.value || []).map(async (list) => {
      const fieldResponse = await this.spHttpClient!.get(`${this.siteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(list.Title).replace(/'/g, "''")}')/fields?$select=Title,InternalName,Hidden&$filter=Hidden eq false`, spConfig.v1);
      const fieldJson = fieldResponse.ok ? await fieldResponse.json() as { value?: Array<{ Title: string; InternalName: string }> } : { value: [] };
      return { title: list.Title, fields: (fieldJson.value || []).map((field) => ({ title: field.Title, internalName: field.InternalName })) };
    }));
    return { lists };
  }
}
