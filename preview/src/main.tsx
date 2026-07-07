import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ServerRoomDigitalTwin from '../../src/webparts/serverRoomDigitalTwin/components/ServerRoomDigitalTwin';
import './preview.css';

ReactDOM.render(
  <React.StrictMode>
    <ServerRoomDigitalTwin
      description="Static GitHub Pages preview"
      racksListName="Racks"
      devicesListName="Devices"
      useDummyData={true}
    />
  </React.StrictMode>,
  document.getElementById('root')
);
