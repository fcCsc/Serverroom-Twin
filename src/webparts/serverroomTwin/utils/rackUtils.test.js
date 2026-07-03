const assert = require('node:assert/strict');
const test = require('node:test');
const {
  calculateRackCapacity,
  devicesOverlap,
  filterDevices,
  validateRackUnitPlacement
} = require('./rackUtils');

const devices = [
  {
    id: 'srv-01',
    name: 'SharePoint App Server',
    status: 'online',
    location: 'Room A',
    deviceType: 'Server',
    rackId: 'rack-a',
    startUnit: 1,
    unitHeight: 2
  },
  {
    id: 'sw-01',
    name: 'Core Switch',
    status: 'maintenance',
    location: 'Room A',
    deviceType: 'Switch',
    rackId: 'rack-a',
    startUnit: 5,
    unitHeight: 1
  },
  {
    id: 'ups-01',
    name: 'Backup UPS',
    status: 'offline',
    location: 'Room B',
    deviceType: 'UPS',
    rackId: 'rack-b',
    startUnit: 10,
    unitHeight: 4
  }
];

test('filters devices by device name search text', () => {
  assert.deepEqual(filterDevices(devices, { searchText: 'sharepoint' }), [devices[0]]);
});

test('filters devices by status', () => {
  assert.deepEqual(filterDevices(devices, { status: 'maintenance' }), [devices[1]]);
});

test('filters devices by location', () => {
  assert.deepEqual(filterDevices(devices, { location: 'Room B' }), [devices[2]]);
});

test('filters devices by device type', () => {
  assert.deepEqual(filterDevices(devices, { deviceType: 'switch' }), [devices[1]]);
});

test('calculates rack capacity from dummy rack fixtures', () => {
  assert.deepEqual(calculateRackCapacity(devices, 'rack-a', 10), {
    totalUnits: 10,
    usedUnits: 3,
    availableUnits: 7,
    utilizationPercent: 30
  });
});

test('detects overlapping device unit ranges', () => {
  assert.equal(devicesOverlap({ startUnit: 3, unitHeight: 3 }, { startUnit: 5, unitHeight: 2 }), true);
  assert.equal(devicesOverlap({ startUnit: 3, unitHeight: 2 }, { startUnit: 5, unitHeight: 2 }), false);
});

test('detects invalid rack unit placements', () => {
  assert.deepEqual(
    validateRackUnitPlacement(
      { id: 'new', rackId: 'rack-a', startUnit: 2, unitHeight: 6 },
      devices,
      6
    ),
    {
      isValid: false,
      errors: ['Device placement exceeds rack capacity of 6U.', 'Device overlaps with SharePoint App Server.']
    }
  );
});
