const normalize = (value) => value.trim().toLocaleLowerCase();

function filterDevices(devices, filters = {}) {
  const searchText = normalize(filters.searchText || '');
  const status = filters.status && filters.status !== 'all' ? filters.status : undefined;
  const location = filters.location && filters.location !== 'all' ? normalize(filters.location) : undefined;
  const deviceType = filters.deviceType && filters.deviceType !== 'all' ? normalize(filters.deviceType) : undefined;

  return devices.filter((device) => {
    if (searchText && !normalize(device.name).includes(searchText)) {
      return false;
    }

    if (status && device.status !== status) {
      return false;
    }

    if (location && normalize(device.location) !== location) {
      return false;
    }

    if (deviceType && normalize(device.deviceType) !== deviceType) {
      return false;
    }

    return true;
  });
}

function calculateRackCapacity(devices, rackId, totalUnits) {
  if (!Number.isInteger(totalUnits) || totalUnits <= 0) {
    throw new Error('totalUnits must be a positive integer.');
  }

  const usedUnits = devices
    .filter((device) => device.rackId === rackId)
    .reduce((sum, device) => sum + device.unitHeight, 0);

  return {
    totalUnits,
    usedUnits,
    availableUnits: Math.max(totalUnits - usedUnits, 0),
    utilizationPercent: Math.round((usedUnits / totalUnits) * 100)
  };
}

function devicesOverlap(first, second) {
  const firstEnd = first.startUnit + first.unitHeight - 1;
  const secondEnd = second.startUnit + second.unitHeight - 1;

  return first.startUnit <= secondEnd && second.startUnit <= firstEnd;
}

function validateRackUnitPlacement(candidate, rackDevices, totalUnits) {
  const errors = [];

  if (!Number.isInteger(candidate.startUnit) || candidate.startUnit < 1) {
    errors.push('Start unit must be a positive integer.');
  }

  if (!Number.isInteger(candidate.unitHeight) || candidate.unitHeight < 1) {
    errors.push('Unit height must be a positive integer.');
  }

  const endUnit = candidate.startUnit + candidate.unitHeight - 1;
  if (Number.isInteger(candidate.startUnit) && Number.isInteger(candidate.unitHeight) && endUnit > totalUnits) {
    errors.push(`Device placement exceeds rack capacity of ${totalUnits}U.`);
  }

  const overlappingDevice = rackDevices
    .filter((device) => device.rackId === candidate.rackId && device.id !== candidate.id)
    .find((device) => devicesOverlap(candidate, device));

  if (overlappingDevice) {
    errors.push(`Device overlaps with ${overlappingDevice.name}.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  calculateRackCapacity,
  devicesOverlap,
  filterDevices,
  validateRackUnitPlacement
};
