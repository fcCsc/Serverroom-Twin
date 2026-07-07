import { mockDevices, mockListDiscovery, mockRacks } from '../data/mockData';
import { IAppConfiguration, IDataProviderResult, IListDiscoveryResult } from '../models/ServerRoomModels';
import { IDataProvider, IListDiscoveryService } from './IDataProvider';

export class MockDataProvider implements IDataProvider {
  public async loadData(_config: IAppConfiguration): Promise<IDataProviderResult> {
    return { racks: mockRacks, devices: mockDevices, warning: 'Preview is using safe dummy data only.' };
  }
}

export class MockListDiscoveryService implements IListDiscoveryService {
  public async discover(): Promise<IListDiscoveryResult> {
    return mockListDiscovery;
  }
}
