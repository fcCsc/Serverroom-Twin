import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './preview.css';

ReactDOM.render(
  <React.StrictMode>
    <ServerRoomDigitalTwin
      description="Interactive 3D server room dashboard preview"
      racksListName="Preview Racks"
      devicesListName="Preview Devices"
      useDummyData={true}
      enableGlbLoading={true}
    />
  </React.StrictMode>,
  document.getElementById('root')
);
