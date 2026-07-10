import { dashboardDevices, dashboardPlacements, dashboardRacks } from '../data/mockData';

export const mockDataSource = {
  getRacks: () => dashboardRacks,
  getDevices: () => dashboardDevices,
  getRackPlacements: () => dashboardPlacements
};
