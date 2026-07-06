import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ServerRoomDigitalTwin from '../../src/webparts/serverRoomDigitalTwin/components/ServerRoomDigitalTwin';
import './preview.css';

ReactDOM.render(
  <React.StrictMode>
    <ServerRoomDigitalTwin
      description="Static GitHub Pages preview"
      racksListName="Preview Racks"
      devicesListName="Preview Devices"
      modelAssetsListName="Preview Model Assets"
      deviceTypeAssetMappingsListName="Preview Device Type Asset Mappings"
      assetLibraryPath="Site Assets/ServerRoom3DAssets"
      enableGlbLoading={false}
      useDummyData={true}
    />
  </React.StrictMode>,
  document.getElementById('root')
);
