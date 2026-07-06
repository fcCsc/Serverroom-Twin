export type DeviceType = 'Server' | 'Switch' | 'Storage' | 'Firewall' | 'PatchPanel' | 'UPS';
export type MountWidth = 'Full' | 'Half' | 'Third' | 'Quarter';
export type RackSide = 'Front' | 'Rear';

export interface IRoom {
  RoomKey: string;
  Title: string;
  Description: string;
  SortOrder: number;
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
  SerialNumber?: string;
  WarrantyExpiry?: string;
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
