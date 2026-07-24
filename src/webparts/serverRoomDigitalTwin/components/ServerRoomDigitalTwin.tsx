import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import ServerRoom3DView from './ServerRoom3DView';
import { defaultAssetLibraryPath, mockDevices, mockModelAssets, mockRacks, mockRooms } from '../data/mockData';
import { IDevice, IRack, IRoom, DeviceType, MountWidth, RackSide } from '../models/ServerRoomModels';
import { IServerRoomDigitalTwinProps } from './IServerRoomDigitalTwinProps';

const rackSideOptions: RackSide[] = ['Front', 'Rear'];
type ViewMode = 'Room' | 'Elevation';
const viewModes: ViewMode[] = ['Room', 'Elevation'];
const deviceTypes: DeviceType[] = ['Backup', 'Firewall', 'Switch', 'Server', 'UPS', 'Storage', 'PatchPanel'];

const typeLabels: { [key in DeviceType]: string } = {
  Switch: 'Switch / network',
  Server: 'Server / compute',
  Firewall: 'Firewall / security',
  Storage: 'Storage',
  UPS: 'UPS / power',
  PatchPanel: 'Patch panel',
  Backup: 'Backup / archive'
};

const widthPercent: { [key in MountWidth]: number } = {
  Full: 100,
  Half: 50,
  Third: 33.333,
  Quarter: 25
};

const getLocation = (room: IRoom): string => room.Location || 'Demo Campus';
const getFloor = (room: IRoom): string => room.Floor || 'Floor 1';
const getDeviceHeight = (device: IDevice): number => device.UHeight || 1;
const getDeviceLeft = (device: IDevice): number => {
  const width = widthPercent[device.MountWidth];
  return Math.max(0, Math.min(100 - width, (device.HorizontalSlot - 1) * width));
};
const hasBrowserWindow = (): boolean => typeof window !== 'undefined';

const ServerRoomDigitalTwin: React.FC<IServerRoomDigitalTwinProps> = ({ racksListName, devicesListName, modelAssetsListName, deviceTypeAssetMappingsListName, assetLibraryPath, currentSiteUrl, enableGlbLoading, useDummyData }) => {
  const rooms: IRoom[] = mockRooms;
  const racks: IRack[] = mockRacks;
  const devices: IDevice[] = mockDevices;

  const locations = Array.from(new Set(rooms.map(getLocation)));
  const [selectedLocation, setSelectedLocation] = React.useState<string>(locations[0]);
  const floors = Array.from(new Set(rooms.filter((room) => getLocation(room) === selectedLocation).map(getFloor)));
  const [selectedFloor, setSelectedFloor] = React.useState<string>(floors[0]);
  const visibleRooms = rooms.filter((room) => getLocation(room) === selectedLocation && getFloor(room) === selectedFloor);
  const visibleRoomKeys = visibleRooms.map((room) => room.RoomKey);
  const visibleRacks = racks.filter((rack) => visibleRoomKeys.indexOf(rack.RoomKey) > -1);
  const [selectedRackKey, setSelectedRackKey] = React.useState<string>(visibleRacks[0] ? visibleRacks[0].RackKey : '');
  const [selectedDeviceKey, setSelectedDeviceKey] = React.useState<string | undefined>();
  const [rackSide, setRackSide] = React.useState<RackSide>('Front');
  const [viewMode, setViewMode] = React.useState<ViewMode>(() => currentSiteUrl ? 'Room' : 'Elevation');
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(false);
  const [sceneMessage, setSceneMessage] = React.useState<string | undefined>();
  const [visibleColumns, setVisibleColumns] = React.useState<{ [key: string]: boolean }>({ manufacturer: true, model: true, ip: true, vlan: true, serial: true, warranty: true, maintenance: true });

  React.useEffect(() => {
    const nextFloors = Array.from(new Set(rooms.filter((room) => getLocation(room) === selectedLocation).map(getFloor)));
    if (nextFloors.length > 0 && nextFloors.indexOf(selectedFloor) === -1) setSelectedFloor(nextFloors[0]);
  }, [selectedLocation, selectedFloor, rooms]);

  React.useEffect(() => {
    if (visibleRacks.length > 0 && !visibleRacks.some((rack) => rack.RackKey === selectedRackKey)) {
      setSelectedRackKey(visibleRacks[0].RackKey);
      setSelectedDeviceKey(undefined);
    }
  }, [selectedRackKey, visibleRacks]);

  const selectedRack = racks.filter((rack) => rack.RackKey === selectedRackKey)[0] || visibleRacks[0];
  const selectedDevice = selectedDeviceKey ? devices.filter((device) => device.DeviceKey === selectedDeviceKey)[0] : undefined;
  const areaDevices = devices.filter((device) => visibleRacks.some((rack) => rack.RackKey === device.RackKey));
  const sideDevices = areaDevices.filter((device) => device.RackSide === rackSide);
  const selectedRackDevices = sideDevices.filter((device) => device.RackKey === selectedRackKey);
  const effectiveAssetLibraryPath = assetLibraryPath || (currentSiteUrl ? defaultAssetLibraryPath : 'assets/glb');
  const glbLoadingEnabled = enableGlbLoading !== false;

  const onRackSelected = React.useCallback((rackKey: string): void => {
    setSelectedRackKey(rackKey);
    setSelectedDeviceKey(undefined);
  }, []);

  const onDeviceSelected = React.useCallback((device: IDevice): void => {
    setSelectedRackKey(device.RackKey);
    setSelectedDeviceKey(device.DeviceKey);
  }, []);

  const toggleColumn = React.useCallback((column: string): void => {
    setVisibleColumns((current) => ({ ...current, [column]: !current[column] }));
  }, []);

  const onSceneUnavailable = React.useCallback((message: string): void => {
    setSceneMessage(message);
    setViewMode('Elevation');
  }, []);

  return (
    <section className={styles.digitalTwin}>
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>Serverroom Twin • Final visual preview</span>
          <h1>Rack Room Digital Twin</h1>
          <p>Premium 3D/2.5D rack room with GLB asset loading, U-accurate rack placement, front/rear inspection and SharePoint mapping placeholders.</p>
        </div>
        <div className={styles.headerControls}>
          <div className={styles.sideToggle} aria-label="View mode toggle">
            {viewModes.map((mode) => <button key={mode} className={viewMode === mode ? styles.activeToggle : ''} onClick={() => setViewMode(mode)}>{mode === 'Room' ? '3D Room' : 'Rack elevation'}</button>)}
          </div>
          <div className={styles.sideToggle} aria-label="Rack side toggle">
            {rackSideOptions.map((side) => <button key={side} className={rackSide === side ? styles.activeToggle : ''} onClick={() => { setRackSide(side); setSelectedDeviceKey(undefined); }}>{side}</button>)}
          </div>
          <button onClick={() => setSettingsOpen(!settingsOpen)}>{settingsOpen ? 'Close admin settings' : 'Admin settings'}</button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <h2>Location → Floor → Rack</h2>
          {locations.map((location) => (
            <div key={location} className={styles.locationGroup}>
              <button className={`${styles.roomNav} ${selectedLocation === location ? styles.active : ''}`} onClick={() => setSelectedLocation(location)}>{location}</button>
              {selectedLocation === location && Array.from(new Set(rooms.filter((room) => getLocation(room) === location).map(getFloor))).map((floor) => (
                <div key={floor} className={styles.floorGroup}>
                  <button className={`${styles.floorNav} ${selectedFloor === floor ? styles.active : ''}`} onClick={() => setSelectedFloor(floor)}>{floor}</button>
                  {selectedFloor === floor && visibleRacks.map((rack) => <button key={rack.RackKey} className={`${styles.rackNav} ${selectedRackKey === rack.RackKey ? styles.active : ''}`} onClick={() => onRackSelected(rack.RackKey)}><span>{rack.Title}</span><span>{rack.RackHeightU}U</span></button>)}
                </div>
              ))}
            </div>
          ))}
          <div className={styles.legend}>
            <h3>Device type marking</h3>
            {deviceTypes.map((type) => <span key={type} className={`${styles.legendItem} ${styles[`type${type}`]}`}><i />{typeLabels[type]}</span>)}
          </div>
        </aside>

        <main className={styles.rackView}>
          <div className={styles.sectionTitle}><h2>{selectedLocation} • {selectedFloor}</h2><span>{visibleRacks.length} racks • {rackSide} • {glbLoadingEnabled ? 'GLB ready' : 'primitive fallback'}</span></div>

          {viewMode === 'Room' && (
            <div className={styles.scenePanel}>
              {sceneMessage && <p className={styles.sceneWarning}>{sceneMessage}</p>}
              <ServerRoom3DView
                racks={visibleRacks}
                devices={sideDevices}
                modelAssets={mockModelAssets}
                assetLibraryPath={effectiveAssetLibraryPath}
                currentSiteUrl={currentSiteUrl}
                enableGlbLoading={glbLoadingEnabled}
                selectedRackKey={selectedRackKey}
                selectedDeviceKey={selectedDeviceKey}
                onRackSelected={onRackSelected}
                onDeviceSelected={onDeviceSelected}
                onSceneUnavailable={onSceneUnavailable}
              />
              <div className={styles.focusBar}>
                <strong>{selectedRack ? selectedRack.Title : 'No rack selected'}</strong>
                <span>{selectedDevice ? `${selectedDevice.Title} • U${selectedDevice.UPosition} • ${selectedDevice.MountWidth}` : 'Click a rack or device to inspect details'}</span>
              </div>
            </div>
          )}

          {viewMode === 'Elevation' && <React.Fragment>
            <div className={styles.elevationHeader}>
              <h2>Rack elevation navigator</h2>
              <span>U-accurate placement • {rackSide} view</span>
            </div>
            <div className={styles.elevationGrid}>
              {visibleRacks.map((rack) => <RackElevation key={rack.RackKey} rack={rack} devices={sideDevices.filter((device) => device.RackKey === rack.RackKey)} rackSide={rackSide} selectedRackKey={selectedRackKey} selectedDeviceKey={selectedDeviceKey} onRackSelected={onRackSelected} onDeviceSelected={onDeviceSelected} />)}
            </div>
          </React.Fragment>}
        </main>

        <aside className={styles.detailPanel}>
          <h2>Rack Details</h2>
          {selectedRack && <Details rows={{ Rack: selectedRack.Title, Location: selectedLocation, Floor: selectedFloor, Row: selectedRack.RowLabel, Number: selectedRack.RackNumber, Height: `${selectedRack.RackHeightU}U`, Side: rackSide, Notes: selectedRack.Notes || '' }} />}
          <h2>Device Details</h2>
          {selectedDevice ? <Details rows={{ Device: selectedDevice.Title, Type: typeLabels[selectedDevice.DeviceType], Rack: selectedRack ? selectedRack.Title : selectedDevice.RackKey, Position: `U${selectedDevice.UPosition} / ${getDeviceHeight(selectedDevice)}U`, Width: `${selectedDevice.MountWidth}, slot ${selectedDevice.HorizontalSlot}`, Manufacturer: selectedDevice.Manufacturer || 'Demo manufacturer', Model: selectedDevice.Model || 'Demo model', IP: selectedDevice.IPAddress || 'Demo IP only', VLAN: selectedDevice.VLAN || 'Demo VLAN', Serial: selectedDevice.SerialNumber || 'Demo serial', Warranty: selectedDevice.WarrantyExpiry || 'Demo warranty', Maintenance: selectedDevice.MaintenanceResponsible || selectedDevice.Owner, Notes: selectedDevice.Notes || '' }} /> : <p className={styles.panelHint}>Select a device in the 3D room or rack elevation to inspect inventory details.</p>}
          {settingsOpen && <AdminSettings visibleColumns={visibleColumns} toggleColumn={toggleColumn} racksListName={racksListName} devicesListName={devicesListName} modelAssetsListName={modelAssetsListName} deviceTypeAssetMappingsListName={deviceTypeAssetMappingsListName} assetLibraryPath={effectiveAssetLibraryPath} useDummyData={useDummyData} enableGlbLoading={glbLoadingEnabled} isPreview={!currentSiteUrl && hasBrowserWindow()} />}
        </aside>
      </div>

      <footer className={styles.tablePanel}>
        <div className={styles.inventoryHeader}><h2>Inventory • {selectedRack ? selectedRack.Title : 'No rack selected'}</h2><span>{selectedRackDevices.length} devices • {rackSide} side</span></div>
        <table><thead><tr><th>Device</th><th>Type</th><th>Rack</th>{visibleColumns.manufacturer && <th>Manufacturer</th>}{visibleColumns.model && <th>Model</th>}{visibleColumns.ip && <th>IP</th>}{visibleColumns.vlan && <th>VLAN</th>}{visibleColumns.serial && <th>Serial</th>}{visibleColumns.warranty && <th>Warranty</th>}{visibleColumns.maintenance && <th>Maintenance responsible</th>}</tr></thead><tbody>
          {selectedRackDevices.map((device) => {
            const rack = racks.filter((candidate) => candidate.RackKey === device.RackKey)[0];
            return <tr key={device.DeviceKey} className={selectedDeviceKey === device.DeviceKey ? styles.selectedRow : ''} onClick={() => onDeviceSelected(device)}><td>{device.Title}</td><td>{typeLabels[device.DeviceType]}</td><td>{rack ? rack.Title : device.RackKey}</td>{visibleColumns.manufacturer && <td>{device.Manufacturer}</td>}{visibleColumns.model && <td>{device.Model}</td>}{visibleColumns.ip && <td>{device.IPAddress}</td>}{visibleColumns.vlan && <td>{device.VLAN}</td>}{visibleColumns.serial && <td>{device.SerialNumber}</td>}{visibleColumns.warranty && <td>{device.WarrantyExpiry}</td>}{visibleColumns.maintenance && <td>{device.MaintenanceResponsible}</td>}</tr>;
          })}
        </tbody></table>
      </footer>
    </section>
  );
};

const RackElevation: React.FC<{ rack: IRack; devices: IDevice[]; rackSide: RackSide; selectedRackKey?: string; selectedDeviceKey?: string; onRackSelected: (rackKey: string) => void; onDeviceSelected: (device: IDevice) => void; }> = ({ rack, devices, selectedRackKey, selectedDeviceKey, onRackSelected, onDeviceSelected }) => {
  const units = Array.from({ length: rack.RackHeightU }, (_, index) => rack.RackHeightU - index);
  return (
    <article className={`${styles.elevationCard} ${selectedRackKey === rack.RackKey ? styles.selectedRack : ''}`} onClick={() => onRackSelected(rack.RackKey)}>
      <div className={styles.rackTop}><strong>{rack.Title}</strong><span>{rack.RackHeightU}U</span></div>
      <div className={styles.rackShell} style={{ gridTemplateRows: `repeat(${rack.RackHeightU}, minmax(10px, 1fr))`, height: `${Math.max(260, Math.round(620 * rack.RackHeightU / 42))}px` }}>
        <div className={styles.uLabels}>{units.map((unit) => <span key={unit}>U{unit}</span>)}</div>
        <div className={styles.rackSlots}>{units.map((unit) => <span key={unit} />)}{devices.map((device) => {
          const height = getDeviceHeight(device);
          const top = ((rack.RackHeightU - device.UPosition - height + 1) / rack.RackHeightU) * 100;
          return <button key={device.DeviceKey} className={`${styles.deviceBlock} ${styles[`type${device.DeviceType}`]} ${selectedDeviceKey === device.DeviceKey ? styles.selectedDevice : ''}`} style={{ top: `${top}%`, height: `${(height / rack.RackHeightU) * 100}%`, left: `${getDeviceLeft(device)}%`, width: `${widthPercent[device.MountWidth]}%` }} onClick={(event) => { event.stopPropagation(); onDeviceSelected(device); }}><strong>{device.Title}</strong><span>U{device.UPosition} • {height}U • {device.MountWidth}</span></button>;
        })}</div>
      </div>
    </article>
  );
};

const AdminSettings: React.FC<{ visibleColumns: { [key: string]: boolean }; toggleColumn: (column: string) => void; racksListName?: string; devicesListName?: string; modelAssetsListName?: string; deviceTypeAssetMappingsListName?: string; assetLibraryPath?: string; useDummyData?: boolean; enableGlbLoading: boolean; isPreview: boolean; }> = ({ visibleColumns, toggleColumn, racksListName, devicesListName, modelAssetsListName, deviceTypeAssetMappingsListName, assetLibraryPath, useDummyData, enableGlbLoading, isPreview }) => (
  <div className={styles.settings}><h3>Visible inventory columns</h3>{Object.keys(visibleColumns).map((column) => <label key={column}><input type="checkbox" checked={visibleColumns[column]} onChange={() => toggleColumn(column)} /> {column}</label>)}<h3>SharePoint column mapping placeholders</h3><p>Racks list: {racksListName || 'Racks'}</p><p>Devices list: {devicesListName || 'Devices'}</p><p>Model assets list: {modelAssetsListName || 'Model Assets'}</p><p>Device type mappings list: {deviceTypeAssetMappingsListName || 'DeviceTypeAssetMappings'}</p><p>Asset path: {assetLibraryPath || 'assets/glb'}</p><p>GLB loading: {enableGlbLoading ? 'Enabled' : 'Disabled'}</p><p>Runtime: {isPreview ? 'GitHub Pages preview' : 'SharePoint/SPFx'}</p><p>Dummy data only: {useDummyData ? 'Yes' : 'Yes for MVP preview'}</p><p>Mapping placeholders: Location, Floor, RackKey, DeviceKey, UPosition, UHeight, MountWidth, HorizontalSlot, RackSide, Manufacturer, Model, IPAddress, VLAN, SerialNumber, WarrantyExpiry, MaintenanceResponsible.</p></div>
);

const Details: React.FC<{ rows: { [key: string]: string } }> = ({ rows }) => <dl className={styles.details}>{Object.keys(rows).map((key) => <React.Fragment key={key}><dt>{key}</dt><dd>{rows[key]}</dd></React.Fragment>)}</dl>;

export default ServerRoomDigitalTwin;
