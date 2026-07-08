import { mockDataSource } from './mockDataSource';
import { sharePointDataSource } from './sharePointDataSource';

export const getServerRoomDataSource = (useDummyData: boolean = true) => useDummyData || !sharePointDataSource.enabled ? mockDataSource : mockDataSource;
