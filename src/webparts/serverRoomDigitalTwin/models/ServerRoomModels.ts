// SharePoint-ready MVP model for the 2D / 2.5D rack dashboard.
export type DeviceType = 'Server' | 'Switch' | 'Storage' | 'Firewall' | 'PatchPanel' | 'UPS' | 'Appliance';
export type MountWidth = 'Full' | 'Half' | 'Third' | 'Quarter';
export type RackSide = 'Front' | 'Rear';

export interface IRack {
  RackKey: string;
  Floor: string;
  Room: string;
  Location: string;
  RackHeightU: number;
  Responsible: string;
  Occupancy: string;
  Notes?: string;
}

export interface IDevice {
  DeviceKey: string;
  DeviceName: string;
  RackKey: string;
  UPosition: number;
  UHeight?: number;
  DeviceType: DeviceType;
  IPAddress?: string;
  VLAN?: string;
  PowerConsumptionW?: number;
  SerialNumber?: string;
  WarrantyExpiry?: string;
  MaintenanceResponsible: string;
  Manufacturer?: string;
  Model?: string;
  AssetTag?: string;
  RackSide?: RackSide;
  MountWidth?: MountWidth;
  HorizontalSlot?: number;
  Notes?: string;
}

export interface IColumnMappingSettings {
  racksListName: string;
  devicesListName: string;
  rackColumns: {
    rackKey: 'Rack-ID';
    floor: 'floor';
    location: 'Location';
    rackHeightU: 'height unit';
    responsible: 'Responsible';
    occupancy: 'Occupancy';
  };
  deviceColumns: {
    deviceKey: 'Device ID';
    rackKey: 'Rack-ID';
    uPosition: 'U-Position';
    deviceType: 'Device Type';
    ipAddress: 'IP Address';
    vlan: 'VLAN';
    powerConsumptionW: 'Power Consumption (W)';
    serialNumber: 'Serial Number';
    warrantyExpiry: 'Warranty Expiry';
    maintenanceResponsible: 'Maintenance Responsible';
  };
}

export interface IRackColumnMappings {
  RackKey: string;
  Location: string;
  Floor: string;
  RackHeightU: string;
  Responsible: string;
  Occupancy: string;
  Notes?: string;
}

export interface IDeviceColumnMappings {
  DeviceKey: string;
  DeviceName: string;
  RackKey: string;
  UPosition: string;
  DeviceType: string;
  IPAddress: string;
  VLAN: string;
  PowerConsumptionW: string;
  SerialNumber: string;
  WarrantyExpiry: string;
  MaintenanceResponsible: string;
  UHeight?: string;
  Manufacturer?: string;
  Model?: string;
  AssetTag?: string;
  RackSide?: string;
  MountWidth?: string;
  HorizontalSlot?: string;
  Notes?: string;
}

export interface IAppColumnMappings {
  racks: IRackColumnMappings;
  devices: IDeviceColumnMappings;
}

export interface IAppConfiguration {
  racksListName: string;
  devicesListName: string;
  columnMappings: IAppColumnMappings;
  inventoryVisibleColumns: string[];
  useDummyData: boolean;
  allowDummyFallback: boolean;
  defaultRackSide: RackSide;
  defaultMountWidth: MountWidth;
  defaultUHeight: number;
  configListName: 'ServerRoomAppConfig';
}

export interface IDataProviderResult {
  racks: IRack[];
  devices: IDevice[];
  warning?: string;
}

export interface IListFieldOption {
  title: string;
  internalName: string;
}

export interface IListOption {
  title: string;
  fields: IListFieldOption[];
}

export interface IListDiscoveryResult {
  lists: IListOption[];
}

export interface IConnectionValidationResult {
  ok: boolean;
  messages: string[];
}
