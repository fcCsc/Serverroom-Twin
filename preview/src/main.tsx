import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ServerRoomDigitalTwin from '../../src/webparts/serverRoomDigitalTwin/components/ServerRoomDigitalTwin';
import './preview.css';

ReactDOM.render(
  <React.StrictMode>
    <ServerRoomDigitalTwin
      description="Static 2D / 2.5D rack elevation MVP preview"
      racksListName="Preview Racks"
      devicesListName="Preview Devices"
      useDummyData={true}
      enableGlbLoading={false}
    />
  </React.StrictMode>,
  document.getElementById('root')
);
