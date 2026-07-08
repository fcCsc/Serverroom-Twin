import * as React from 'react';
import AppShell from './AppShell';
import RoomOverview from './RoomOverview';
import RackFocusView from './RackFocusView';
import RightDetailsPanel from './RightDetailsPanel';
import { dashboardDevices, dashboardPlacements, dashboardRacks } from '../data/mockData';
import { IInfraDevice, IInfraRack, IRackPlacement, RackMountSide } from '../models/ServerRoomModels';
import { IServerRoomDigitalTwinProps } from './IServerRoomDigitalTwinProps';

const ServerRoomDashboard: React.FC<IServerRoomDigitalTwinProps> = (props) => {
  const racks: IInfraRack[] = dashboardRacks;
  const devices: IInfraDevice[] = dashboardDevices;
  const placements: IRackPlacement[] = dashboardPlacements;
  const [selectedRackId, setSelectedRackId] = React.useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | null>(null);
  const [rackSide, setRackSide] = React.useState<RackMountSide>('front');
  const [activeTab, setActiveTab] = React.useState<string>('Front');
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(false);

  const selectedRack = selectedRackId ? racks.filter((rack) => rack.id === selectedRackId)[0] : undefined;
  const selectedDevice = selectedDeviceId ? devices.filter((device) => device.id === selectedDeviceId)[0] : undefined;

  const onRackSelected = (rackId: string): void => {
    setSelectedRackId(rackId);
    setSelectedDeviceId(null);
    setRackSide('front');
    setActiveTab('Front');
  };

  const onBackToRoom = (): void => {
    setSelectedRackId(null);
    setSelectedDeviceId(null);
  };

  return (
    <AppShell
      racks={racks}
      devices={devices}
      placements={placements}
      settingsOpen={settingsOpen}
      onSettingsToggle={() => setSettingsOpen(!settingsOpen)}
      details={<RightDetailsPanel racks={racks} devices={devices} placements={placements} selectedRack={selectedRack} selectedDevice={selectedDevice} settingsOpen={settingsOpen} props={props} />}
    >
      {selectedRackId === null ? (
        <RoomOverview racks={racks} devices={devices} placements={placements} selectedRackId={selectedRackId} onRackSelected={onRackSelected} />
      ) : selectedRack ? (
        <RackFocusView rack={selectedRack} devices={devices} placements={placements} selectedDeviceId={selectedDeviceId} rackSide={rackSide} activeTab={activeTab} onRackSideChange={setRackSide} onTabChange={setActiveTab} onBack={onBackToRoom} onDeviceSelected={setSelectedDeviceId} />
      ) : null}
    </AppShell>
  );
};

export default ServerRoomDashboard;
