import { IDevice, IDeviceTypeAssetMapping, IModelAsset, IRack, IRoom } from '../models/ServerRoomModels';

export const defaultAssetLibraryPath: string = 'Site Assets/ServerRoom3DAssets';

export const mockRooms: IRoom[] = [
  {
    RoomKey: 'demo-room-a',
    Title: 'Demo Server Room A',
    Description: 'Safe dummy room used for visual guidance and rack placement previews.',
    SortOrder: 1,
    Location: 'Demo Campus',
    Floor: 'Floor 1'
  },
  {
    RoomKey: 'demo-room-b',
    Title: 'Demo Server Room B',
    Description: 'Second safe dummy room for floor navigation and rack elevation previews.',
    SortOrder: 2,
    Location: 'Demo Campus',
    Floor: 'Floor 2'
  }
];

export const mockRacks: IRack[] = [
  { RackKey: 'rack-a01', RoomKey: 'demo-room-a', Title: 'Rack A01', RowLabel: 'A', RackNumber: '01', RackHeightU: 42, XPosition: -3.2, ZPosition: 0, Rotation: 0, ModelAssetKey: 'rack', Notes: 'Primary demo rack with mixed full-width and half-width devices.', Responsible: 'Infrastructure Team' },
  { RackKey: 'rack-a02', RoomKey: 'demo-room-a', Title: 'Rack A02', RowLabel: 'A', RackNumber: '02', RackHeightU: 42, XPosition: 0, ZPosition: 0, Rotation: 0, ModelAssetKey: 'rack', Notes: 'Demo rack showing rear-mounted and power equipment examples.', Responsible: 'Operations Team' },
  { RackKey: 'rack-a03', RoomKey: 'demo-room-a', Title: 'Rack A03', RowLabel: 'A', RackNumber: '03', RackHeightU: 42, XPosition: 3.2, ZPosition: 0, Rotation: 0, ModelAssetKey: 'rack', Notes: 'Demo rack reserved for storage and documentation examples.', Responsible: 'Platform Team' },
  { RackKey: 'rack-b01', RoomKey: 'demo-room-b', Title: 'Rack B01', RowLabel: 'B', RackNumber: '01', RackHeightU: 48, XPosition: -1.6, ZPosition: 0, Rotation: 0, ModelAssetKey: 'rack', Notes: 'Tall dummy rack used to validate 48U scaling.', Responsible: 'Infrastructure Team' },
  { RackKey: 'rack-b02', RoomKey: 'demo-room-b', Title: 'Rack B02', RowLabel: 'B', RackNumber: '02', RackHeightU: 24, XPosition: 1.6, ZPosition: 0, Rotation: 0, ModelAssetKey: 'rack', Notes: 'Short dummy edge rack used to validate variable U scale.', Responsible: 'Edge Team' },
  { RackKey: 'rack-b03', RoomKey: 'demo-room-b', Title: 'Rack B03', RowLabel: 'B', RackNumber: '03', RackHeightU: 12, XPosition: 4.2, ZPosition: 0, Rotation: 0, ModelAssetKey: 'rack', Notes: 'Compact 12U wall cabinet dummy example.', Responsible: 'Facilities Team' },
  { RackKey: 'rack-b04', RoomKey: 'demo-room-b', Title: 'Rack B04', RowLabel: 'B', RackNumber: '04', RackHeightU: 36, XPosition: 6.0, ZPosition: 0, Rotation: 0, ModelAssetKey: 'rack', Notes: '36U dummy rack for mid-size cabinet preview.', Responsible: 'Infrastructure Team' },
  { RackKey: 'rack-b05', RoomKey: 'demo-room-b', Title: 'Rack B05', RowLabel: 'B', RackNumber: '05', RackHeightU: 45, XPosition: 7.8, ZPosition: 0, Rotation: 0, ModelAssetKey: 'rack', Notes: '45U dummy rack for tall cabinet preview.', Responsible: 'Platform Team' }
];

export const mockDevices: IDevice[] = [
  { DeviceKey: 'dev-sw-001', RackKey: 'rack-a01', Title: 'SW-DEMO-LEFT', DeviceType: 'Switch', UPosition: 41, UHeight: 1, MountWidth: 'Half', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'switch', Owner: 'Network Team', Environment: 'Demo', Notes: 'Half-width dummy switch mounted at U41, left slot.', Manufacturer: 'Demo Networks', Model: 'DN-SW-24', IPAddress: '192.0.2.11', VLAN: 'DEMO-110', SerialNumber: 'DEMO-SW-001', WarrantyExpiry: '2027-06-30', MaintenanceResponsible: 'Network Team', AssetTag: 'DEMO-ASSET-NET', PowerConsumptionW: 85 },
  { DeviceKey: 'dev-sw-002', RackKey: 'rack-a01', Title: 'SW-DEMO-RIGHT', DeviceType: 'Switch', UPosition: 41, UHeight: 1, MountWidth: 'Half', HorizontalSlot: 2, RackSide: 'Front', ModelAssetKey: 'switch', Owner: 'Network Team', Environment: 'Demo', Notes: 'Half-width dummy switch mounted at U41, right slot.', Manufacturer: 'Demo Networks', Model: 'DN-SW-24', IPAddress: '192.0.2.12', VLAN: 'DEMO-110', SerialNumber: 'DEMO-SW-002', WarrantyExpiry: '2027-06-30', MaintenanceResponsible: 'Network Team', AssetTag: 'DEMO-ASSET-NET', PowerConsumptionW: 85 },
  { DeviceKey: 'dev-app-001', RackKey: 'rack-a01', Title: 'APP-DEMO-001', DeviceType: 'Server', UPosition: 36, UHeight: 2, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'server', Owner: 'Platform Team', Environment: 'Demo', Notes: 'Full-width 2U dummy application server.', Manufacturer: 'Demo Compute', Model: 'DC-2U', IPAddress: '192.0.2.21', VLAN: 'DEMO-210', SerialNumber: 'DEMO-SRV-001', WarrantyExpiry: '2028-03-31', MaintenanceResponsible: 'Platform Team', AssetTag: 'DEMO-ASSET-COMPUTE', PowerConsumptionW: 420 },
  { DeviceKey: 'dev-sto-001', RackKey: 'rack-a01', Title: 'STO-DEMO-001', DeviceType: 'Storage', UPosition: 28, UHeight: 4, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'storage', Owner: 'Infrastructure Team', Environment: 'Demo', Notes: 'Full-width 4U dummy storage shelf.', Manufacturer: 'Demo Storage', Model: 'DS-4U', IPAddress: '192.0.2.31', VLAN: 'DEMO-310', SerialNumber: 'DEMO-STO-001', WarrantyExpiry: '2028-12-31', MaintenanceResponsible: 'Infrastructure Team', AssetTag: 'DEMO-ASSET-STORAGE', PowerConsumptionW: 640 },
  { DeviceKey: 'dev-fw-001', RackKey: 'rack-a02', Title: 'FW-DEMO-001', DeviceType: 'Firewall', UPosition: 39, UHeight: 1, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'firewall', Owner: 'Network Team', Environment: 'Shared', Notes: 'Dummy firewall appliance for placement guidance only.', Manufacturer: 'Demo Security', Model: 'DFW-1U', IPAddress: '192.0.2.41', VLAN: 'DEMO-410', SerialNumber: 'DEMO-FW-001', WarrantyExpiry: '2027-09-30', MaintenanceResponsible: 'Network Team', AssetTag: 'DEMO-ASSET-NET', PowerConsumptionW: 85 },
  { DeviceKey: 'dev-ups-001', RackKey: 'rack-a02', Title: 'UPS-DEMO-001', DeviceType: 'UPS', UPosition: 1, UHeight: 4, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Rear', ModelAssetKey: 'ups', Owner: 'Operations Team', Environment: 'Facilities', Notes: 'Rear-side dummy UPS example.', Manufacturer: 'Demo Power', Model: 'DUPS-4U', IPAddress: '192.0.2.51', VLAN: 'DEMO-510', SerialNumber: 'DEMO-UPS-001', WarrantyExpiry: '2029-01-31', MaintenanceResponsible: 'Operations Team', AssetTag: 'DEMO-ASSET-POWER', PowerConsumptionW: 900 },
  { DeviceKey: 'dev-patch-001', RackKey: 'rack-a03', Title: 'PATCH-DEMO-001', DeviceType: 'PatchPanel', UPosition: 42, UHeight: 1, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'patchpanel', Owner: 'Network Team', Environment: 'Shared', Notes: 'Dummy patch panel for documentation examples.', Manufacturer: 'Demo Cabling', Model: 'DPP-48', IPAddress: 'N/A', VLAN: 'DEMO-PATCH', SerialNumber: 'DEMO-PATCH-001', WarrantyExpiry: '2027-05-31', MaintenanceResponsible: 'Network Team', AssetTag: 'DEMO-ASSET-NET', PowerConsumptionW: 85 },
  { DeviceKey: 'dev-third-001', RackKey: 'rack-b01', Title: 'APP-DEMO-THIRD', DeviceType: 'Server', UPosition: 44, UHeight: 1, MountWidth: 'Third', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'server', Owner: 'Platform Team', Environment: 'Demo', Notes: 'Third-width dummy compute node.', Manufacturer: 'Demo Compute', Model: 'DC-1U-S', IPAddress: '192.0.2.61', VLAN: 'DEMO-230', SerialNumber: 'DEMO-SRV-003', WarrantyExpiry: '2028-03-31', MaintenanceResponsible: 'Platform Team', AssetTag: 'DEMO-ASSET-COMPUTE', PowerConsumptionW: 420 },
  { DeviceKey: 'dev-quarter-001', RackKey: 'rack-b01', Title: 'SENSOR-DEMO-Q1', DeviceType: 'Switch', UPosition: 42, UHeight: 1, MountWidth: 'Quarter', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'switch', Owner: 'Network Team', Environment: 'Demo', Notes: 'Quarter-width dummy network sensor.', Manufacturer: 'Demo Networks', Model: 'DN-Q', IPAddress: '192.0.2.62', VLAN: 'DEMO-120', SerialNumber: 'DEMO-QTR-001', WarrantyExpiry: '2027-10-31', MaintenanceResponsible: 'Network Team', AssetTag: 'DEMO-ASSET-NET', PowerConsumptionW: 85 },
  { DeviceKey: 'dev-ups-002', RackKey: 'rack-b02', Title: 'UPS-DEMO-EDGE', DeviceType: 'UPS', UPosition: 1, UHeight: 3, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'ups', Owner: 'Operations Team', Environment: 'Facilities', Notes: 'Short-rack dummy UPS block.', Manufacturer: 'Demo Power', Model: 'DUPS-3U', IPAddress: '192.0.2.63', VLAN: 'DEMO-510', SerialNumber: 'DEMO-UPS-002', WarrantyExpiry: '2029-01-31', MaintenanceResponsible: 'Operations Team', AssetTag: 'DEMO-ASSET-POWER', PowerConsumptionW: 900 },
  { DeviceKey: 'dev-edge-001', RackKey: 'rack-b03', Title: 'EDGE-DEMO-001', DeviceType: 'Server', UPosition: 9, UHeight: 1, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'server', Owner: 'Edge Team', Environment: 'Demo', Notes: 'Compact 12U rack dummy server.', Manufacturer: 'Demo Compute', Model: 'DC-1U-E', IPAddress: '192.0.2.71', VLAN: 'DEMO-240', SerialNumber: 'DEMO-EDGE-001', WarrantyExpiry: '2028-08-31', MaintenanceResponsible: 'Edge Team', AssetTag: 'DEMO-ASSET-EDGE', PowerConsumptionW: 180 },
  { DeviceKey: 'dev-conflict-001', RackKey: 'rack-b04', Title: 'LAB-DEMO-FULL', DeviceType: 'Storage', UPosition: 20, UHeight: 2, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'storage', Owner: 'Infrastructure Team', Environment: 'Demo', Notes: 'Intentional dummy placement conflict marker example.', Manufacturer: 'Demo Storage', Model: 'DS-LAB', IPAddress: '192.0.2.72', VLAN: 'DEMO-320', SerialNumber: 'DEMO-LAB-001', WarrantyExpiry: '2028-11-30', MaintenanceResponsible: 'Infrastructure Team', AssetTag: 'DEMO-ASSET-LAB', PowerConsumptionW: 520 },
  { DeviceKey: 'dev-conflict-002', RackKey: 'rack-b04', Title: 'LAB-DEMO-HALF', DeviceType: 'Firewall', UPosition: 20, UHeight: 1, MountWidth: 'Half', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'firewall', Owner: 'Network Team', Environment: 'Demo', Notes: 'Intentional dummy placement conflict marker example.', Manufacturer: 'Demo Security', Model: 'DFW-LAB', IPAddress: '192.0.2.73', VLAN: 'DEMO-420', SerialNumber: 'DEMO-LAB-002', WarrantyExpiry: '2027-11-30', MaintenanceResponsible: 'Network Team', AssetTag: 'DEMO-ASSET-FWLAB', PowerConsumptionW: 120 },
  { DeviceKey: 'dev-app-002', RackKey: 'rack-a03', Title: 'APP-DEMO-002', DeviceType: 'Server', UPosition: 34, UHeight: 2, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'server', Owner: 'Platform Team', Environment: 'Training', Notes: 'Additional full-width 2U dummy server.', Manufacturer: 'Demo Compute', Model: 'DC-2U', IPAddress: '192.0.2.22', VLAN: 'DEMO-220', SerialNumber: 'DEMO-SRV-002', WarrantyExpiry: '2028-03-31', MaintenanceResponsible: 'Platform Team', AssetTag: 'DEMO-ASSET-COMPUTE', PowerConsumptionW: 420 }
];

export const mockModelAssets: IModelAsset[] = [
  { ModelAssetKey: 'rack', Title: 'Rack cabinet', FileName: 'rack.glb', LibraryRelativePath: `${defaultAssetLibraryPath}/rack.glb`, DefaultForDeviceType: 'Rack', ScaleX: 1, ScaleY: 1, ScaleZ: 1, RotationOffset: 0 },
  { ModelAssetKey: 'switch', Title: 'Network switch', FileName: 'switch.glb', LibraryRelativePath: `${defaultAssetLibraryPath}/switch.glb`, DefaultForDeviceType: 'Switch', ScaleX: 1, ScaleY: 1, ScaleZ: 1, RotationOffset: 0 },
  { ModelAssetKey: 'server', Title: 'Server', FileName: 'server.glb', LibraryRelativePath: `${defaultAssetLibraryPath}/server.glb`, DefaultForDeviceType: 'Server', ScaleX: 1, ScaleY: 1, ScaleZ: 1, RotationOffset: 0 },
  { ModelAssetKey: 'firewall', Title: 'Firewall', FileName: 'firewall.glb', LibraryRelativePath: `${defaultAssetLibraryPath}/firewall.glb`, DefaultForDeviceType: 'Firewall', ScaleX: 1, ScaleY: 1, ScaleZ: 1, RotationOffset: 0 },
  { ModelAssetKey: 'storage', Title: 'Storage array', FileName: 'storage.glb', LibraryRelativePath: `${defaultAssetLibraryPath}/storage.glb`, DefaultForDeviceType: 'Storage', ScaleX: 1, ScaleY: 1, ScaleZ: 1, RotationOffset: 0 },
  { ModelAssetKey: 'ups', Title: 'UPS', FileName: 'ups.glb', LibraryRelativePath: `${defaultAssetLibraryPath}/ups.glb`, DefaultForDeviceType: 'UPS', ScaleX: 1, ScaleY: 1, ScaleZ: 1, RotationOffset: 0 },
  { ModelAssetKey: 'patchpanel', Title: 'Patch panel', FileName: 'patchpanel.glb', LibraryRelativePath: `${defaultAssetLibraryPath}/patchpanel.glb`, DefaultForDeviceType: 'PatchPanel', ScaleX: 1, ScaleY: 1, ScaleZ: 1, RotationOffset: 0 }
];


export const mockDeviceTypeAssetMappings: IDeviceTypeAssetMapping[] = [
  { DeviceType: 'Rack', ModelAssetKey: 'rack' },
  { DeviceType: 'Switch', ModelAssetKey: 'switch', DefaultMountWidth: 'Half', DefaultUHeight: 1 },
  { DeviceType: 'Server', ModelAssetKey: 'server', DefaultMountWidth: 'Full', DefaultUHeight: 2 },
  { DeviceType: 'Firewall', ModelAssetKey: 'firewall', DefaultMountWidth: 'Full', DefaultUHeight: 1 },
  { DeviceType: 'Storage', ModelAssetKey: 'storage', DefaultMountWidth: 'Full', DefaultUHeight: 4 },
  { DeviceType: 'UPS', ModelAssetKey: 'ups', DefaultMountWidth: 'Full', DefaultUHeight: 4 },
  { DeviceType: 'PatchPanel', ModelAssetKey: 'patchpanel', DefaultMountWidth: 'Full', DefaultUHeight: 1 }
];
