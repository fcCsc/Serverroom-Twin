export type DeviceType = 'Server' | 'Switch' | 'Storage' | 'Firewall' | 'Patch Panel' | 'UPS';
export type MountWidth = 'Full' | 'Half' | 'Third' | 'Quarter';
export type RackSide = 'Front' | 'Rear';
export type LifecycleStatus = 'Installed' | 'Planned' | 'Spare' | 'Decommissioned';

export interface IRack {
  id: string;
  name: string;
  location: string;
  room: string;
  row: string;
  rackNumber: string;
  totalUnits: number;
  xPosition: number;
  zPosition: number;
  rotation: number;
  responsible: string;
  notes: string;
}

export interface IDevice {
  id: string;
  name: string;
  rackId: string;
  unitStart: number;
  unitHeight: number;
  mountWidth: MountWidth;
  horizontalSlot: number;
  rackSide: RackSide;
  type: DeviceType;
  lifecycleStatus: LifecycleStatus;
  environment: string;
  owner: string;
  ipAddress: string;
  vlan: string;
  powerConsumption: string;
  serialNumber: string;
  warrantyExpiry: string;
  notes: string;
}

export interface IListMappingSettings {
  racksListName: string;
  devicesListName: string;
  rackIdColumn: string;
  deviceRackColumn: string;
  unitStartColumn: string;
  unitHeightColumn: string;
  mountWidthColumn: string;
  horizontalSlotColumn: string;
  rackSideColumn: string;
}
