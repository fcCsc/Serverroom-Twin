import type { Device, Rack } from '../types';

export const dummyRacks: Rack[] = [
  { id: 'rack-a', name: 'Rack A', location: 'Demo Row 1', capacityU: 42 },
  { id: 'rack-b', name: 'Rack B', location: 'Demo Row 1', capacityU: 42 },
];

export const dummyDevices: Device[] = [
  { id: 'dev-1', name: 'Core Switch 01', type: 'Network', status: 'online', rackId: 'rack-a', uPosition: 40 },
  { id: 'dev-2', name: 'Hypervisor Node 02', type: 'Compute', status: 'warning', rackId: 'rack-a', uPosition: 32 },
  { id: 'dev-3', name: 'Storage Array 01', type: 'Storage', status: 'online', rackId: 'rack-b', uPosition: 20 },
];
