import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ServerRoomDigitalTwin from '../../src/webparts/serverRoomDigitalTwin/components/ServerRoomDigitalTwin';
import './preview.css';

// GitHub Pages is a dummy-data preview only; SharePoint runtime enables GLB loading from its configured asset library.
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
