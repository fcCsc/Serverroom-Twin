import { IDevice, IDeviceTypeAssetMapping, IModelAsset, IRack, IRoom } from '../models/ServerRoomModels';

export const defaultAssetLibraryPath: string = 'Site Assets/ServerRoom3DAssets';

export const mockRooms: IRoom[] = [
  {
    RoomKey: 'demo-room-a',
    Title: 'Demo Server Room A',
    Description: 'Safe dummy room used for visual guidance and rack placement previews.',
    SortOrder: 1
  }
];

export const mockRacks: IRack[] = [
  { RackKey: 'rack-a01', RoomKey: 'demo-room-a', Title: 'Rack A01', RowLabel: 'A', RackNumber: '01', RackHeightU: 42, XPosition: -3.2, ZPosition: 0, Rotation: 0, ModelAssetKey: 'rack', Notes: 'Primary demo rack with mixed full-width and half-width devices.' },
  { RackKey: 'rack-a02', RoomKey: 'demo-room-a', Title: 'Rack A02', RowLabel: 'A', RackNumber: '02', RackHeightU: 42, XPosition: 0, ZPosition: 0, Rotation: 0, ModelAssetKey: 'rack', Notes: 'Demo rack showing rear-mounted and power equipment examples.' },
  { RackKey: 'rack-a03', RoomKey: 'demo-room-a', Title: 'Rack A03', RowLabel: 'A', RackNumber: '03', RackHeightU: 42, XPosition: 3.2, ZPosition: 0, Rotation: 0, ModelAssetKey: 'rack', Notes: 'Demo rack reserved for storage and documentation examples.' }
];

export const mockDevices: IDevice[] = [
  { DeviceKey: 'dev-sw-001', RackKey: 'rack-a01', Title: 'SW-DEMO-LEFT', DeviceType: 'Switch', UPosition: 41, UHeight: 1, MountWidth: 'Half', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'switch', Owner: 'Network Team', Environment: 'Demo', Notes: 'Half-width dummy switch mounted at U41, left slot.' },
  { DeviceKey: 'dev-sw-002', RackKey: 'rack-a01', Title: 'SW-DEMO-RIGHT', DeviceType: 'Switch', UPosition: 41, UHeight: 1, MountWidth: 'Half', HorizontalSlot: 2, RackSide: 'Front', ModelAssetKey: 'switch', Owner: 'Network Team', Environment: 'Demo', Notes: 'Half-width dummy switch mounted at U41, right slot.' },
  { DeviceKey: 'dev-app-001', RackKey: 'rack-a01', Title: 'APP-DEMO-001', DeviceType: 'Server', UPosition: 36, UHeight: 2, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'server', Owner: 'Platform Team', Environment: 'Demo', Notes: 'Full-width 2U dummy application server.' },
  { DeviceKey: 'dev-sto-001', RackKey: 'rack-a01', Title: 'STO-DEMO-001', DeviceType: 'Storage', UPosition: 28, UHeight: 4, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'storage', Owner: 'Infrastructure Team', Environment: 'Demo', Notes: 'Full-width 4U dummy storage shelf.' },
  { DeviceKey: 'dev-fw-001', RackKey: 'rack-a02', Title: 'FW-DEMO-001', DeviceType: 'Firewall', UPosition: 39, UHeight: 1, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'firewall', Owner: 'Network Team', Environment: 'Shared', Notes: 'Dummy firewall appliance for placement guidance only.' },
  { DeviceKey: 'dev-ups-001', RackKey: 'rack-a02', Title: 'UPS-DEMO-001', DeviceType: 'UPS', UPosition: 1, UHeight: 4, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Rear', ModelAssetKey: 'ups', Owner: 'Operations Team', Environment: 'Facilities', Notes: 'Rear-side dummy UPS example.' },
  { DeviceKey: 'dev-patch-001', RackKey: 'rack-a03', Title: 'PATCH-DEMO-001', DeviceType: 'PatchPanel', UPosition: 42, UHeight: 1, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'patchpanel', Owner: 'Network Team', Environment: 'Shared', Notes: 'Dummy patch panel for documentation examples.' },
  { DeviceKey: 'dev-app-002', RackKey: 'rack-a03', Title: 'APP-DEMO-002', DeviceType: 'Server', UPosition: 34, UHeight: 2, MountWidth: 'Full', HorizontalSlot: 1, RackSide: 'Front', ModelAssetKey: 'server', Owner: 'Platform Team', Environment: 'Training', Notes: 'Additional full-width 2U dummy server.' }
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
