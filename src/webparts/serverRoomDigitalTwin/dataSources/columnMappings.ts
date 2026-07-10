export const rackColumnMappings = {
  'Rack-ID': 'RackKey',
  floor: 'Floor',
  Location: 'Location',
  'height unit': 'RackHeightU',
  Responsible: 'Responsible',
  Occupancy: 'Occupancy'
};

export const deviceColumnMappings = {
  'Device ID': 'DeviceKey / DeviceName',
  'Rack-ID': 'RackKey',
  'U-Position': 'UPosition',
  'Device Type': 'DeviceType',
  'IP Address': 'IPAddress',
  VLAN: 'VLAN',
  'Power Consumption (W)': 'PowerConsumptionW',
  'Serial Number': 'SerialNumber',
  'Warranty Expiry': 'WarrantyExpiry',
  'Maintenance Responsible': 'MaintenanceResponsible'
};

export const futureOptionalDeviceFields = ['UHeight', 'Manufacturer', 'Model', 'AssetTag', 'RackSide', 'MountWidth', 'HorizontalSlot', 'Notes'];
