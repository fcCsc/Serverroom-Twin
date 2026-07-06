export interface IServerRoomDigitalTwinProps {
  description: string;
  racksListName: string;
  devicesListName: string;
  modelAssetsListName?: string;
  deviceTypeAssetMappingsListName?: string;
  assetLibraryPath?: string;
  currentSiteUrl?: string;
  enableGlbLoading?: boolean;
  useDummyData: boolean;
}
