export type DeviceType = 'Server' | 'Switch' | 'Storage' | 'Firewall' | 'PatchPanel' | 'UPS' | 'Backup';
export type MountWidth = 'Full' | 'Half' | 'Third' | 'Quarter';
export type RackSide = 'Front' | 'Rear';

export interface IRoom {
  RoomKey: string;
  Title: string;
  Description: string;
  SortOrder: number;
  Location?: string;
  Floor?: string;
}

export interface IRack {
  RackKey: string;
  RoomKey: string;
  Title: string;
  RowLabel: string;
  RackNumber: string;
  RackHeightU: number;
  XPosition: number;
  ZPosition: number;
  Rotation: number;
  ModelAssetKey: string;
  Notes: string;
  Responsible?: string;
}

export interface IDevice {
  DeviceKey: string;
  RackKey: string;
  Title: string;
  DeviceType: DeviceType;
  UPosition: number;
  UHeight: number;
  MountWidth: MountWidth;
  HorizontalSlot: number;
  RackSide: RackSide;
  ModelAssetKey: string;
  Owner: string;
  Notes: string;
  Environment?: string;
  IPAddress?: string;
  VLAN?: string;
  PowerConsumption?: string;
  PowerConsumptionW?: number;
  SerialNumber?: string;
  AssetTag?: string;
  WarrantyExpiry?: string;
  Manufacturer?: string;
  Model?: string;
  MaintenanceResponsible?: string;
}

export interface IModelAsset {
  ModelAssetKey: string;
  Title: string;
  FileName: string;
  LibraryRelativePath: string;
  DefaultForDeviceType?: DeviceType | 'Rack';
  ScaleX: number;
  ScaleY: number;
  ScaleZ: number;
  RotationOffset: number;
}

export interface IDeviceTypeAssetMapping {
  DeviceType: DeviceType | 'Rack';
  ModelAssetKey: string;
  DefaultMountWidth?: MountWidth;
  DefaultUHeight?: number;
}

export interface IListMappingSettings {
  roomsListName: string;
  racksListName: string;
  devicesListName: string;
  modelAssetsListName: string;
  assetLibraryPath: string;
  rackKeyColumn: string;
  deviceRackColumn: string;
  uPositionColumn: string;
  uHeightColumn: string;
  mountWidthColumn: string;
  horizontalSlotColumn: string;
  rackSideColumn: string;
  modelAssetKeyColumn: string;
}

export type InfraStatus = 'online' | 'warning' | 'critical' | 'offline' | 'maintenance';
export type RackMountSide = 'front' | 'rear' | 'both';
export type RackMountType = 'standard' | 'vertical-pdu' | 'side' | 'shelf' | 'blank';

export interface IInfraRack {
  id: string;
  name: string;
  site: string;
  room: string;
  row: string;
  heightU: number;
  positionX: number;
  positionY: number;
  status: InfraStatus;
  type: string;
  width: string;
  depth: string;
}

export interface IInfraDevice {
  id: string;
  hostname: string;
  type: DeviceType;
  vendor: string;
  model: string;
  serialNumber: string;
  ipAddress: string;
  vlan?: string;
  status: InfraStatus;
  owner: string;
  operatingSystem: string;
  lastUpdate: string;
  uptime: string;
  warrantyExpiry?: string;
  notes: string;
}

export interface IRackPlacement {
  id: string;
  rackId: string;
  deviceId: string;
  startU: number;
  heightU: number;
  mountSide: RackMountSide;
  mountType: RackMountType;
  frontLabel: string;
  rearLabel: string;
}
