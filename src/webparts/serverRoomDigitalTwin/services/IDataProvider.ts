import { IAppConfiguration, IDataProviderResult, IListDiscoveryResult } from '../models/ServerRoomModels';

export interface IDataProvider {
  loadData(config: IAppConfiguration): Promise<IDataProviderResult>;
}

export interface IListDiscoveryService {
  discover(): Promise<IListDiscoveryResult>;
}
