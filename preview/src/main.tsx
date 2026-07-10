import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ServerRoomDigitalTwin from '../../src/webparts/serverRoomDigitalTwin/components/ServerRoomDigitalTwin';
import './preview.css';

ReactDOM.render(
  <React.StrictMode>
    <ServerRoomDigitalTwin
      description="GLB Block Visualizer Preview v1"
      racksListName="Preview Racks"
      devicesListName="Preview Devices"
      useDummyData={true}
      enableGlbLoading={true}
    />
  </React.StrictMode>,
  document.getElementById('root')
);
