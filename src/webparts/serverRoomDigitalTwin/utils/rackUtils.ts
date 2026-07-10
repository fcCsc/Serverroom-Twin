import { IInfraDevice, IInfraRack, IRackPlacement, RackMountSide } from '../models/ServerRoomModels';

export const rackUnits = (heightU: number): number[] => Array.from({ length: heightU || 42 }, (_, index) => (heightU || 42) - index);

export const placementVisibleOnSide = (placement: IRackPlacement, side: RackMountSide): boolean => placement.mountSide === side || placement.mountSide === 'both';

export const getRackPlacements = (rackId: string, placements: readonly IRackPlacement[]): IRackPlacement[] => placements.filter((placement) => placement.rackId === rackId);

export const getPlacementDevice = (placement: IRackPlacement, devices: readonly IInfraDevice[]): IInfraDevice | undefined => devices.filter((device) => device.id === placement.deviceId)[0];

export const getUsedUnits = (placements: readonly IRackPlacement[]): number => {
  const used: { [key: number]: boolean } = {};
  placements.forEach((placement) => {
    for (let offset = 0; offset < (placement.heightU || 1); offset++) used[placement.startU + offset] = true;
  });
  return Object.keys(used).length;
};

export const getOccupancy = (rack: IInfraRack, placements: readonly IRackPlacement[]): number => Math.min(100, Math.round((getUsedUnits(placements) / (rack.heightU || 42)) * 100));

export const getPlacementConflicts = (placements: readonly IRackPlacement[], side: RackMountSide): { [placementId: string]: boolean } => {
  const occupancy: { [key: string]: string[] } = {};
  placements.filter((placement) => placementVisibleOnSide(placement, side)).forEach((placement) => {
    for (let offset = 0; offset < (placement.heightU || 1); offset++) {
      const key = `${placement.rackId}:${placement.startU + offset}`;
      occupancy[key] = [...(occupancy[key] || []), placement.id];
    }
  });
  return placements.reduce((result, placement) => ({ ...result, [placement.id]: Object.keys(occupancy).some((key) => occupancy[key].indexOf(placement.id) > -1 && occupancy[key].length > 1) }), {});
};

export const statusLabel = (status: string): string => ({ online: 'Online', warning: 'Warning', critical: 'Critical', offline: 'Offline', maintenance: 'Maintenance' }[status] || status);
