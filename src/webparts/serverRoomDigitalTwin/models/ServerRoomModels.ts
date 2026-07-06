// SharePoint-ready MVP model for the 2D / 2.5D rack dashboard.
export type DeviceType = 'Server' | 'Switch' | 'Storage' | 'Firewall' | 'PatchPanel' | 'UPS' | 'Appliance';
export type MountWidth = 'Full' | 'Half' | 'Third' | 'Quarter';
export type RackSide = 'Front' | 'Rear';

export interface IRack {
  RackKey: string;
  Floor: string;
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
