export type HealthStatus = 'Healthy' | 'Warning' | 'Critical' | 'Offline';
export type DeviceType = 'Server' | 'Switch' | 'Storage' | 'Firewall' | 'Patch Panel' | 'UPS';

export interface IRack {
  id: string;
  name: string;
  location: string;
  row: string;
  rackNumber: string;
  totalUnits: number;
  status: HealthStatus;
}

export interface IDevice {
  id: string;
  name: string;
  rackId: string;
  unitStart: number;
  unitHeight: number;
  type: DeviceType;
  status: HealthStatus;
  environment: string;
  owner: string;
  notes: string;
}

export interface IListMappingSettings {
  racksListName: string;
  devicesListName: string;
  rackIdColumn: string;
  deviceRackColumn: string;
  statusColumn: string;
  unitStartColumn: string;
  unitHeightColumn: string;
}
