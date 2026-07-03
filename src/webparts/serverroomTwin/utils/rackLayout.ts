export interface RackReference {
  id?: string;
  title?: string;
  name?: string;
  totalUnits: number;
}

export interface RackDeviceLayout {
  id?: string;
  title?: string;
  name?: string;
  rackId?: string;
  unitStart: number;
  unitHeight: number;
}

export type RackLayoutSeverity = 'error' | 'warning';

export type RackLayoutIssueCode =
  | 'device_unit_start_out_of_bounds'
  | 'device_unit_height_not_positive'
  | 'device_exceeds_rack_units'
  | 'device_overlap'
  | 'unknown_rack_reference';

export interface RackLayoutIssue {
  code: RackLayoutIssueCode;
  severity: RackLayoutSeverity;
  message: string;
  deviceId?: string;
  rackId?: string;
  conflictingDeviceId?: string;
}

export interface RackLayoutValidationResult<TDevice extends RackDeviceLayout = RackDeviceLayout> {
  validDevices: TDevice[];
  issues: RackLayoutIssue[];
}

const getDeviceLabel = (device: RackDeviceLayout): string =>
  device.title ?? device.name ?? device.id ?? 'Unknown device';

const getRackLabel = (rack: RackReference): string => rack.title ?? rack.name ?? rack.id ?? 'Unknown rack';

export const getDeviceUnitEnd = (device: Pick<RackDeviceLayout, 'unitStart' | 'unitHeight'>): number =>
  device.unitStart + device.unitHeight - 1;

export const isDeviceUnitStartWithinRackBounds = (
  device: Pick<RackDeviceLayout, 'unitStart'>,
  rack: Pick<RackReference, 'totalUnits'>
): boolean => Number.isFinite(device.unitStart) && device.unitStart >= 1 && device.unitStart <= rack.totalUnits;

export const isDeviceUnitHeightPositive = (device: Pick<RackDeviceLayout, 'unitHeight'>): boolean =>
  Number.isFinite(device.unitHeight) && device.unitHeight > 0;

export const doesDeviceFitWithinRack = (
  device: Pick<RackDeviceLayout, 'unitStart' | 'unitHeight'>,
  rack: Pick<RackReference, 'totalUnits'>
): boolean => isDeviceUnitHeightPositive(device) && getDeviceUnitEnd(device) <= rack.totalUnits;

export const doDevicesOverlap = (
  first: Pick<RackDeviceLayout, 'unitStart' | 'unitHeight'>,
  second: Pick<RackDeviceLayout, 'unitStart' | 'unitHeight'>
): boolean => {
  if (!isDeviceUnitHeightPositive(first) || !isDeviceUnitHeightPositive(second)) {
    return false;
  }

  return first.unitStart <= getDeviceUnitEnd(second) && second.unitStart <= getDeviceUnitEnd(first);
};

export function validateRackLayout<TDevice extends RackDeviceLayout>(
  racks: readonly RackReference[],
  devices: readonly TDevice[]
): RackLayoutValidationResult<TDevice> {
  const rackById = new Map(racks.filter((rack) => rack.id).map((rack) => [rack.id as string, rack]));
  const issues: RackLayoutIssue[] = [];
  const validCandidatesByRack = new Map<string, TDevice[]>();
  const validDevices: TDevice[] = [];

  devices.forEach((device) => {
    const deviceId = device.id;
    const rackId = device.rackId;

    if (!rackId || !rackById.has(rackId)) {
      issues.push({
        code: 'unknown_rack_reference',
        severity: 'warning',
        message: `${getDeviceLabel(device)} references an unknown rack${rackId ? ` (${rackId})` : ''}.`,
        deviceId,
        rackId
      });
      return;
    }

    const rack = rackById.get(rackId) as RackReference;
    const deviceIssues: RackLayoutIssue[] = [];

    if (!isDeviceUnitStartWithinRackBounds(device, rack)) {
      deviceIssues.push({
        code: 'device_unit_start_out_of_bounds',
        severity: 'error',
        message: `${getDeviceLabel(device)} starts at unit ${device.unitStart}, outside ${getRackLabel(rack)} bounds (1-${rack.totalUnits}).`,
        deviceId,
        rackId
      });
    }

    if (!isDeviceUnitHeightPositive(device)) {
      deviceIssues.push({
        code: 'device_unit_height_not_positive',
        severity: 'error',
        message: `${getDeviceLabel(device)} has non-positive unit height ${device.unitHeight}.`,
        deviceId,
        rackId
      });
    }

    if (isDeviceUnitHeightPositive(device) && !doesDeviceFitWithinRack(device, rack)) {
      deviceIssues.push({
        code: 'device_exceeds_rack_units',
        severity: 'error',
        message: `${getDeviceLabel(device)} ends at unit ${getDeviceUnitEnd(device)}, beyond ${getRackLabel(rack)} capacity (${rack.totalUnits} units).`,
        deviceId,
        rackId
      });
    }

    if (deviceIssues.length > 0) {
      issues.push(...deviceIssues);
      return;
    }

    const rackDevices = validCandidatesByRack.get(rackId) ?? [];
    const overlappingDevice = rackDevices.find((candidate) => doDevicesOverlap(candidate, device));

    if (overlappingDevice) {
      issues.push({
        code: 'device_overlap',
        severity: 'error',
        message: `${getDeviceLabel(device)} overlaps ${getDeviceLabel(overlappingDevice)} in ${getRackLabel(rack)}.`,
        deviceId,
        rackId,
        conflictingDeviceId: overlappingDevice.id
      });
      return;
    }

    rackDevices.push(device);
    validCandidatesByRack.set(rackId, rackDevices);
    validDevices.push(device);
  });

  return { validDevices, issues };
}
