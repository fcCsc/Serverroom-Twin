export interface IServerRoomDigitalTwinProps {
  description: string;
  racksListName: string;
  devicesListName: string;
  useDummyData: boolean;
  currentSiteUrl?: string;
  spHttpClient?: unknown;
}
