import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import { defaultAssetLibraryPath, mockDevices, mockModelAssets, mockRacks, mockRooms } from '../data/mockData';
import { IDevice, IModelAsset, IRack, IRoom, DeviceType, RackSide } from '../models/ServerRoomModels';
import { IServerRoomDigitalTwinProps } from './IServerRoomDigitalTwinProps';
import Rack2DFallbackView from './Rack2DFallbackView';
import ServerRoom3DView from './ServerRoom3DView';

const deviceTypeOptions: Array<DeviceType | 'All'> = ['All', 'Server', 'Switch', 'Storage', 'Firewall', 'PatchPanel', 'UPS'];
const rackSideOptions: Array<RackSide | 'All'> = ['All', 'Front', 'Rear'];

const ServerRoomDigitalTwin: React.FC<IServerRoomDigitalTwinProps> = ({ racksListName, devicesListName, modelAssetsListName, deviceTypeAssetMappingsListName, assetLibraryPath, currentSiteUrl, enableGlbLoading, useDummyData }) => {
  const rooms: IRoom[] = mockRooms;
  const racks: IRack[] = mockRacks;
  const devices: IDevice[] = mockDevices;
  const modelAssets: IModelAsset[] = mockModelAssets;
  const resolvedAssetLibraryPath = assetLibraryPath || defaultAssetLibraryPath;
  const isDummyMode = useDummyData ?? true;
  const shouldEnableGlbLoading = Boolean(enableGlbLoading) && !isDummyMode;

  const [selectedRoomKey, setSelectedRoomKey] = React.useState<string>(rooms[0].RoomKey);
  const [selectedRackKey, setSelectedRackKey] = React.useState<string>(racks[0].RackKey);
  const [selectedDeviceKey, setSelectedDeviceKey] = React.useState<string | undefined>();
  const [search, setSearch] = React.useState<string>('');
  const [deviceTypeFilter, setDeviceTypeFilter] = React.useState<DeviceType | 'All'>('All');
  const [rackSideFilter, setRackSideFilter] = React.useState<RackSide | 'All'>('All');
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(false);
  const [show2DFallback, setShow2DFallback] = React.useState<boolean>(false);
  const [sceneMessage, setSceneMessage] = React.useState<string>('');

  const roomRacks = racks.filter((rack) => rack.RoomKey === selectedRoomKey);
  const selectedRack: IRack | undefined = racks.filter((rack) => rack.RackKey === selectedRackKey)[0];
  const selectedDevice: IDevice | undefined = selectedDeviceKey ? devices.filter((device) => device.DeviceKey === selectedDeviceKey)[0] : undefined;

  const filteredDevices: IDevice[] = devices.filter((device) => {
    const rack = racks.filter((candidate) => candidate.RackKey === device.RackKey)[0];
    const room = rack ? rooms.filter((candidate) => candidate.RoomKey === rack.RoomKey)[0] : undefined;
    const searchText = `${device.Title} ${device.DeviceType} ${device.Owner} ${device.Environment || ''} ${device.RackSide} ${rack ? rack.Title : ''} ${room ? room.Title : ''}`.toLowerCase();
    const matchesSearch = searchText.indexOf(search.toLowerCase()) > -1;
    const matchesDeviceType = deviceTypeFilter === 'All' || device.DeviceType === deviceTypeFilter;
    const matchesRackSide = rackSideFilter === 'All' || device.RackSide === rackSideFilter;
    const matchesRoom = !rack || rack.RoomKey === selectedRoomKey;
    return matchesSearch && matchesDeviceType && matchesRackSide && matchesRoom;
  });

  const rackDevices = selectedRack ? filteredDevices.filter((device) => device.RackKey === selectedRack.RackKey) : filteredDevices;

  const onRoomClick = (roomKey: string): void => {
    const firstRack = racks.filter((rack) => rack.RoomKey === roomKey)[0];
    setSelectedRoomKey(roomKey);
    if (firstRack) setSelectedRackKey(firstRack.RackKey);
    setSelectedDeviceKey(undefined);
  };

  const onRackClick = (rackKey: string): void => {
    const rack = racks.filter((candidate) => candidate.RackKey === rackKey)[0];
    if (rack) setSelectedRoomKey(rack.RoomKey);
    setSelectedRackKey(rackKey);
    setSelectedDeviceKey(undefined);
  };

  const onDeviceClick = (device: IDevice): void => {
    const rack = racks.filter((candidate) => candidate.RackKey === device.RackKey)[0];
    if (rack) setSelectedRoomKey(rack.RoomKey);
    setSelectedRackKey(device.RackKey);
    setSelectedDeviceKey(device.DeviceKey);
  };

  const onSceneUnavailable = React.useCallback((message: string): void => {
    setSceneMessage(message);
    setShow2DFallback(true);
  }, []);

  return (
    <section className={styles.digitalTwin}>
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>SharePoint guidance prototype</span>
          <h1>Server Room Digital Twin</h1>
          <p>Data-driven rack placement, device lookup and 3D visual guidance using safe dummy data.</p>
        </div>
        <div className={styles.headerControls}>
          <input aria-label="Search racks and devices" placeholder="Search room, rack, device, owner..." value={search} onChange={(event) => setSearch(event.currentTarget.value)} />
          <select aria-label="Device type filter" value={deviceTypeFilter} onChange={(event) => setDeviceTypeFilter(event.currentTarget.value as DeviceType | 'All')}>
            {deviceTypeOptions.map((type) => <option key={type}>{type}</option>)}
          </select>
          <select aria-label="Rack side filter" value={rackSideFilter} onChange={(event) => setRackSideFilter(event.currentTarget.value as RackSide | 'All')}>
            {rackSideOptions.map((side) => <option key={side}>{side}</option>)}
          </select>
          <button onClick={() => setShow2DFallback(!show2DFallback)}>{show2DFallback ? 'Show 3D view' : 'Show 2D fallback'}</button>
          <button onClick={() => setSettingsOpen(!settingsOpen)}>{settingsOpen ? 'Close settings' : 'Admin settings'}</button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <h2>Locations, rooms & racks</h2>
          {rooms.map((room) => (
            <div key={room.RoomKey} className={styles.locationGroup}>
              <button className={`${styles.roomNav} ${selectedRoomKey === room.RoomKey ? styles.active : ''}`} onClick={() => onRoomClick(room.RoomKey)}>{room.Title}</button>
              {racks.filter((rack) => rack.RoomKey === room.RoomKey).map((rack) => (
                <button key={rack.RackKey} className={`${styles.rackNav} ${selectedRackKey === rack.RackKey ? styles.active : ''}`} onClick={() => onRackClick(rack.RackKey)}>
                  <span>{rack.Title}</span><span>{rack.RackHeightU}U</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className={styles.rackView}>
          <div className={styles.sectionTitle}>
            <h2>{show2DFallback ? '2D rack fallback' : '3D server room guidance'}</h2>
            <span>{isDummyMode ? 'Dummy data mode' : 'SharePoint Lists mode'}</span>
          </div>
          {sceneMessage && <p className={styles.sceneMessage}>{sceneMessage}</p>}
          {show2DFallback ? (
            <Rack2DFallbackView racks={roomRacks} devices={filteredDevices} selectedRackKey={selectedRackKey} selectedDeviceKey={selectedDeviceKey} onRackSelected={onRackClick} onDeviceSelected={onDeviceClick} />
          ) : (
            <ServerRoom3DView racks={roomRacks} devices={filteredDevices} modelAssets={modelAssets} assetLibraryPath={resolvedAssetLibraryPath} currentSiteUrl={currentSiteUrl} enableGlbLoading={shouldEnableGlbLoading} selectedRackKey={selectedRackKey} selectedDeviceKey={selectedDeviceKey} onRackSelected={onRackClick} onDeviceSelected={onDeviceClick} onSceneUnavailable={onSceneUnavailable} />
          )}
        </main>

        <aside className={styles.detailPanel}>
          <h2>{selectedDevice ? 'Device details' : 'Rack details'}</h2>
          {selectedDevice ? <Details rows={{ Device: selectedDevice.Title, Type: selectedDevice.DeviceType, Rack: selectedRack ? selectedRack.Title : selectedDevice.RackKey, Side: selectedDevice.RackSide, Position: `U${selectedDevice.UPosition} / ${selectedDevice.UHeight}U`, Width: `${selectedDevice.MountWidth}, slot ${selectedDevice.HorizontalSlot}`, Owner: selectedDevice.Owner, Environment: selectedDevice.Environment || 'Not specified', Asset: `${selectedDevice.ModelAssetKey}.glb`, Notes: selectedDevice.Notes }} /> : selectedRack && <Details rows={{ Rack: selectedRack.Title, Room: rooms.filter((room) => room.RoomKey === selectedRack.RoomKey)[0].Title, Row: selectedRack.RowLabel, Number: selectedRack.RackNumber, Height: `${selectedRack.RackHeightU}U`, Position: `X ${selectedRack.XPosition}, Z ${selectedRack.ZPosition}`, Rotation: `${selectedRack.Rotation}°`, Asset: `${selectedRack.ModelAssetKey}.glb`, Devices: `${devices.filter((device) => device.RackKey === selectedRack.RackKey).length}`, Notes: selectedRack.Notes }} />}
          {settingsOpen && <div className={styles.settings}><h3>Future SharePoint mapping</h3><p>Racks list: {racksListName || 'Racks'}</p><p>Devices list: {devicesListName || 'Devices'}</p><p>Model assets list: {modelAssetsListName || 'Model Assets'}</p><p>Device type asset mappings list: {deviceTypeAssetMappingsListName || 'DeviceTypeAssetMappings'}</p><p>Asset library path: {resolvedAssetLibraryPath}</p><p>Use dummy data: {isDummyMode ? 'Yes' : 'No'}</p><p>GLB loading: {shouldEnableGlbLoading ? 'Enabled for SharePoint runtime' : 'Disabled for dummy preview / primitive fallback'}</p><p>Column mapping controls will map RackKey, DeviceKey, UPosition, UHeight, MountWidth, HorizontalSlot, RackSide and ModelAssetKey in a later integration phase.</p></div>}
        </aside>
      </div>

      <footer className={styles.tablePanel}>
        <h2>Device inventory</h2>
        <table><thead><tr><th>Device</th><th>Type</th><th>Rack</th><th>Side</th><th>U position</th><th>Height</th><th>Width / slot</th><th>Owner</th></tr></thead><tbody>
          {(selectedRack ? rackDevices : filteredDevices).map((device) => {
            const rack = racks.filter((candidate) => candidate.RackKey === device.RackKey)[0];
            return <tr key={device.DeviceKey} className={selectedDeviceKey === device.DeviceKey ? styles.selectedRow : ''} onClick={() => onDeviceClick(device)}><td>{device.Title}</td><td>{device.DeviceType}</td><td>{rack ? rack.Title : device.RackKey}</td><td>{device.RackSide}</td><td>U{device.UPosition}</td><td>{device.UHeight}U</td><td>{device.MountWidth} / {device.HorizontalSlot}</td><td>{device.Owner}</td></tr>;
          })}
        </tbody></table>
      </footer>
    </section>
  );
};

const Details: React.FC<{ rows: { [key: string]: string } }> = ({ rows }) => <dl className={styles.details}>{Object.keys(rows).map((key) => <React.Fragment key={key}><dt>{key}</dt><dd>{rows[key]}</dd></React.Fragment>)}</dl>;

export default ServerRoomDigitalTwin;
