import * as React from 'react';
import ServerRoomDashboard from './ServerRoomDashboard';
import { IServerRoomDigitalTwinProps } from './IServerRoomDigitalTwinProps';

const ServerRoomDigitalTwin: React.FC<IServerRoomDigitalTwinProps> = (props) => (
  <ServerRoomDashboard {...props} />
);

ServerRoomDigitalTwin.displayName = 'ServerRoomDigitalTwin';

export default ServerRoomDigitalTwin;
