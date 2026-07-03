export type Device = {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'warning' | 'offline';
  rackId: string;
  uPosition: number;
};

export type Rack = {
  id: string;
  name: string;
  location: string;
  capacityU: number;
};

export type DataSourceState = {
  isSharePointAvailable: boolean;
  isDummyData: boolean;
};
