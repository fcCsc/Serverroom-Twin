import { IDevice, IRack } from '../models/ServerRoomModels';

export const mockRacks: IRack[] = [
  { id: 'rack-a01', name: 'Rack A01', location: 'Demo Lab A', row: 'A', rackNumber: '01', totalUnits: 42, status: 'Healthy' },
  { id: 'rack-a02', name: 'Rack A02', location: 'Demo Lab A', row: 'A', rackNumber: '02', totalUnits: 42, status: 'Warning' },
  { id: 'rack-b01', name: 'Rack B01', location: 'Training Suite', row: 'B', rackNumber: '01', totalUnits: 42, status: 'Critical' },
  { id: 'rack-b02', name: 'Rack B02', location: 'Training Suite', row: 'B', rackNumber: '02', totalUnits: 42, status: 'Offline' }
];

export const mockDevices: IDevice[] = [
  { id: 'dev-app-001', name: 'APP-DEMO-001', rackId: 'rack-a01', unitStart: 38, unitHeight: 2, type: 'Server', status: 'Healthy', environment: 'Demo', owner: 'Platform Team', notes: 'Sample application host' },
  { id: 'dev-sto-001', name: 'STO-DEMO-001', rackId: 'rack-a01', unitStart: 30, unitHeight: 4, type: 'Storage', status: 'Healthy', environment: 'Demo', owner: 'Infrastructure Team', notes: 'Sample storage array' },
  { id: 'dev-sw-001', name: 'SW-DEMO-001', rackId: 'rack-a01', unitStart: 41, unitHeight: 1, type: 'Switch', status: 'Healthy', environment: 'Shared', owner: 'Network Team', notes: 'Demo top-of-rack switch' },
  { id: 'dev-fw-001', name: 'FW-DEMO-001', rackId: 'rack-a02', unitStart: 39, unitHeight: 1, type: 'Firewall', status: 'Warning', environment: 'Shared', owner: 'Network Team', notes: 'Demo security appliance' },
  { id: 'dev-ups-001', name: 'UPS-DEMO-001', rackId: 'rack-a02', unitStart: 1, unitHeight: 4, type: 'UPS', status: 'Healthy', environment: 'Facilities', owner: 'Operations Team', notes: 'Dummy backup power unit' },
  { id: 'dev-app-002', name: 'APP-DEMO-002', rackId: 'rack-b01', unitStart: 35, unitHeight: 2, type: 'Server', status: 'Critical', environment: 'Sandbox', owner: 'Platform Team', notes: 'Demo critical state' },
  { id: 'dev-patch-001', name: 'PATCH-DEMO-001', rackId: 'rack-b01', unitStart: 42, unitHeight: 1, type: 'Patch Panel', status: 'Healthy', environment: 'Shared', owner: 'Network Team', notes: 'Demo patch panel' },
  { id: 'dev-app-003', name: 'APP-DEMO-003', rackId: 'rack-b02', unitStart: 36, unitHeight: 2, type: 'Server', status: 'Offline', environment: 'Training', owner: 'Training Team', notes: 'Dummy offline workload' }
];
