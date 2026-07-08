import * as React from 'react';
import ServerRoomDashboard from './ServerRoomDashboard';
import { IServerRoomDigitalTwinProps } from './IServerRoomDigitalTwinProps';

const ServerRoomDigitalTwin: React.FC<IServerRoomDigitalTwinProps> = (props) => (
  <ServerRoomDashboard {...props} />
);

export default ServerRoomDigitalTwin;
