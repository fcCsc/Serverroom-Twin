import * as React from 'react';
// Final MVP: default experience is the 2D / 2.5D rack visual dashboard.
import styles from './ServerRoomDigitalTwin.module.scss';
import { mockColumnMappings, mockDevices, mockRacks } from '../data/mockData';
import { DeviceType, IDevice, IRack, MountWidth, RackSide } from '../models/ServerRoomModels';
import { IServerRoomDigitalTwinProps } from './IServerRoomDigitalTwinProps';

const deviceTypes: Array<DeviceType | 'All'> = ['All', 'Server', 'Switch', 'Storage', 'Firewall', 'PatchPanel', 'UPS', 'Appliance'];
const inventoryColumns = ['Device', 'Type', 'Manufacturer', 'Model', 'Rack', 'Location', 'Floor', 'UPosition', 'UHeight', 'Side', 'Width', 'IP Address', 'VLAN', 'Serial Number', 'Warranty Expiry', 'Maintenance Responsible'];
const widthSlots: { [key in MountWidth]: number } = { Full: 1, Half: 2, Third: 3, Quarter: 4 };

const getUHeight = (device: IDevice): number => device.UHeight || 1;
const getSide = (device: IDevice): RackSide => device.RackSide || 'Front';
const getWidth = (device: IDevice): MountWidth => device.MountWidth || 'Full';
const getSlot = (device: IDevice): number => device.HorizontalSlot || 1;
const getRack = (device: IDevice): IRack | undefined => mockRacks.filter((rack) => rack.RackKey === device.RackKey)[0];
const getUsedU = (rack: IRack): number => mockDevices.filter((device) => device.RackKey === rack.RackKey).reduce((total, device) => total + getUHeight(device) / widthSlots[getWidth(device)], 0);

const ServerRoomDigitalTwin: React.FC<IServerRoomDigitalTwinProps> = ({ racksListName, devicesListName, useDummyData }) => {
  const firstRack = mockRacks[0];
  const [selectedLocation, setSelectedLocation] = React.useState<string>(firstRack.Location);
  const [selectedRoom, setSelectedRoom] = React.useState<string | undefined>();
  const [selectedRackKey, setSelectedRackKey] = React.useState<string>(firstRack.RackKey);
  const [selectedDeviceKey, setSelectedDeviceKey] = React.useState<string | undefined>();
  const [selectionScope, setSelectionScope] = React.useState<'location' | 'room' | 'rack' | 'device'>('location');
  const [search, setSearch] = React.useState<string>('');
  const [rackFilter, setRackFilter] = React.useState<string>('All');
  const [deviceTypeFilter, setDeviceTypeFilter] = React.useState<DeviceType | 'All'>('All');
  const [rackSide, setRackSide] = React.useState<RackSide>('Front');
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(false);
  const [viewMode, setViewMode] = React.useState<'elevation' | 'blocks'>('blocks');
  const [sceneOffset, setSceneOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>(inventoryColumns);
  const [localUseDummyData, setLocalUseDummyData] = React.useState<boolean>(useDummyData !== false);

  const selectedRack = mockRacks.filter((rack) => rack.RackKey === selectedRackKey)[0];
  const selectedDevice = selectedDeviceKey ? mockDevices.filter((device) => device.DeviceKey === selectedDeviceKey)[0] : undefined;
  const locations = Array.from(new Set(mockRacks.map((rack) => rack.Location)));
  const rooms = Array.from(new Set(mockRacks.filter((rack) => rack.Location === selectedLocation).map((rack) => rack.Room)));
  const scopedRacks = mockRacks.filter((rack) => rack.Location === selectedLocation && (!selectedRoom || rack.Room === selectedRoom) && (selectionScope === 'location' || selectionScope === 'room' || rack.RackKey === selectedRackKey));
  const rackOptions = scopedRacks;
  const areaRacks = scopedRacks.filter((rack) => rackFilter === 'All' || rack.RackKey === rackFilter);
  const areaRackKeys = areaRacks.map((rack) => rack.RackKey);

  const filteredDevices = mockDevices.filter((device) => {
    const rack = getRack(device);
    const text = `${device.DeviceKey} ${device.DeviceName} ${device.DeviceType} ${device.IPAddress || ''} ${device.VLAN || ''} ${device.SerialNumber || ''} ${device.Manufacturer || ''} ${device.Model || ''} ${rack ? `${rack.RackKey} ${rack.Location} ${rack.Room} ${rack.Floor}` : ''}`.toLowerCase();
    return text.indexOf(search.toLowerCase()) > -1 && (deviceTypeFilter === 'All' || device.DeviceType === deviceTypeFilter) && areaRackKeys.indexOf(device.RackKey) > -1;
  });

  const selectLocation = (location: string): void => {
    const rack = mockRacks.filter((candidate) => candidate.Location === location)[0];
    setSelectedLocation(location);
    setSelectedRoom(undefined);
    setRackFilter('All');
    setSelectionScope('location');
    if (rack) setSelectedRackKey(rack.RackKey);
    setSelectedDeviceKey(undefined);
  };

  const selectRoom = (location: string, room: string): void => {
    const rack = mockRacks.filter((candidate) => candidate.Location === location && candidate.Room === room)[0];
    setSelectedLocation(location);
    setSelectedRoom(room);
    setRackFilter('All');
    setSelectionScope('room');
    if (rack) setSelectedRackKey(rack.RackKey);
    setSelectedDeviceKey(undefined);
  };

  const selectRack = (rack: IRack): void => {
    setSelectedLocation(rack.Location);
    setSelectedRoom(rack.Room);
    setSelectedRackKey(rack.RackKey);
    setSelectionScope('rack');
    setSelectedDeviceKey(undefined);
  };

  const selectDevice = (device: IDevice): void => {
    const rack = getRack(device);
    if (rack) {
      setSelectedLocation(rack.Location);
      setSelectedRoom(rack.Room);
      setSelectedRackKey(rack.RackKey);
    }
    setSelectionScope('device');
    setSelectedDeviceKey(device.DeviceKey);
    setRackSide(getSide(device));
  };

  const hasConflict = (device: IDevice, rackDevices: IDevice[]): boolean => rackDevices.some((other) => {
    if (other.DeviceKey === device.DeviceKey || getSide(other) !== getSide(device)) return false;
    const width = getWidth(device);
    const otherWidth = getWidth(other);
    const deviceStart = device.UPosition;
    const deviceEnd = device.UPosition + getUHeight(device) - 1;
    const otherStart = other.UPosition;
    const otherEnd = other.UPosition + getUHeight(other) - 1;
    const overlapsU = deviceStart <= otherEnd && otherStart <= deviceEnd;
    const overlapsSlot = width === 'Full' || otherWidth === 'Full' || (width === otherWidth && getSlot(device) === getSlot(other));
    return overlapsU && overlapsSlot;
  });

  return (
    <section className={styles.digitalTwin}>
      <header className={styles.header}>
        <div><span className={styles.kicker}>2D / 2.5D MVP</span><h1>Server Room Digital Twin</h1><p>SharePoint-ready rack visual guidance with safe dummy inventory data.</p></div>
        <div className={styles.headerControls}>
          <input aria-label="Search devices racks IP serial manufacturer model" placeholder="Search devices, racks, IP, serial, manufacturer, model..." value={search} onChange={(event) => setSearch(event.currentTarget.value)} />
          <select aria-label="Location filter" value={selectedLocation} onChange={(event) => selectLocation(event.currentTarget.value)}>{locations.map((location) => <option key={location}>{location}</option>)}</select>
          <select aria-label="Room filter" value={selectedRoom || 'All rooms'} onChange={(event) => event.currentTarget.value === 'All rooms' ? selectLocation(selectedLocation) : selectRoom(selectedLocation, event.currentTarget.value)}><option>All rooms</option>{rooms.map((room) => <option key={room}>{room}</option>)}</select>
          <select aria-label="Rack filter" value={rackFilter} onChange={(event) => setRackFilter(event.currentTarget.value)}><option>All</option>{rackOptions.map((rack) => <option key={rack.RackKey}>{rack.RackKey}</option>)}</select>
          <select aria-label="Device Type filter" value={deviceTypeFilter} onChange={(event) => setDeviceTypeFilter(event.currentTarget.value as DeviceType | 'All')}>{deviceTypes.map((type) => <option key={type}>{type}</option>)}</select>
          <div className={styles.segmented}><button className={rackSide === 'Front' ? styles.segmentActive : ''} onClick={() => setRackSide('Front')}>Front</button><button className={rackSide === 'Rear' ? styles.segmentActive : ''} onClick={() => setRackSide('Rear')}>Rear</button></div>
          <div className={styles.segmented}><button className={viewMode === 'elevation' ? styles.segmentActive : ''} onClick={() => setViewMode('elevation')}>Rack</button><button className={viewMode === 'blocks' ? styles.segmentActive : ''} onClick={() => setViewMode('blocks')}>2.5D</button></div>
          <button onClick={() => setSettingsOpen(!settingsOpen)}>{settingsOpen ? 'Close settings' : 'Admin/settings'}</button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}><h2>Räumlichkeiten</h2>{locations.map((location) => <details key={location} className={styles.locationGroup} open={selectedLocation === location}><summary onClick={(event) => { event.preventDefault(); selectLocation(location); }}>{location}</summary>{Array.from(new Set(mockRacks.filter((rack) => rack.Location === location).map((rack) => rack.Room))).map((room) => { const roomRacks = mockRacks.filter((rack) => rack.Location === location && rack.Room === room); return <details key={room} open={selectedLocation === location && selectedRoom === room}><summary className={styles.floorNav} onClick={(event) => { event.preventDefault(); selectRoom(location, room); }}><span>{room}</span><small>{roomRacks.length} racks</small></summary>{roomRacks.map((rack) => <details key={rack.RackKey} open={selectedRackKey === rack.RackKey}><summary className={styles.rackNav} onClick={(event) => { event.preventDefault(); selectRack(rack); }}><span>{rack.RackKey}</span><small>{mockDevices.filter((device) => device.RackKey === rack.RackKey).length} devices</small></summary>{mockDevices.filter((device) => device.RackKey === rack.RackKey).map((device) => <button key={device.DeviceKey} className={`${styles.deviceNav} ${selectedDeviceKey === device.DeviceKey ? styles.active : ''}`} onClick={() => selectDevice(device)}>{device.DeviceName}</button>)}</details>)}</details>; })}</details>)}</aside>

        <main className={styles.rackView}><div className={styles.sectionTitle}><h2>{selectedLocation}{selectedRoom ? ` · ${selectedRoom}` : ' · all rooms'}</h2><span>{rackSide} side · {areaRacks.length} rack(s)</span></div>{viewMode === 'blocks' && <div className={styles.sceneControls}><button onClick={() => setSceneOffset({ x: sceneOffset.x - 24, y: sceneOffset.y })}>←</button><button onClick={() => setSceneOffset({ x: sceneOffset.x + 24, y: sceneOffset.y })}>→</button><button onClick={() => setSceneOffset({ x: sceneOffset.x, y: sceneOffset.y - 18 })}>↑</button><button onClick={() => setSceneOffset({ x: sceneOffset.x, y: sceneOffset.y + 18 })}>↓</button><button onClick={() => setSceneOffset({ x: 0, y: 0 })}>Reset</button></div>}{viewMode === 'elevation' ? <div className={styles.rackCanvas}>{areaRacks.map((rack) => <RackElevation key={rack.RackKey} rack={rack} devices={filteredDevices.filter((device) => device.RackKey === rack.RackKey && getSide(device) === rackSide)} selectedRackKey={selectedRackKey} selectedDeviceKey={selectedDeviceKey} hasConflict={hasConflict} onRackSelected={selectRack} onDeviceSelected={selectDevice} />)}</div> : <BlockScene racks={areaRacks} devices={filteredDevices.filter((device) => getSide(device) === rackSide)} selectedRackKey={selectedRackKey} selectedDeviceKey={selectedDeviceKey} offset={sceneOffset} onRackSelected={selectRack} onDeviceSelected={selectDevice} />}</main>

        <aside className={styles.detailPanel}><h2>{selectedDevice ? 'Device details' : 'Rack details'}</h2>{selectedDevice ? <DeviceDetails device={selectedDevice} rack={getRack(selectedDevice)} /> : selectedRack && <RackDetails rack={selectedRack} />}
          <details open><summary>Devices in selected rack</summary><div className={styles.miniList}>{mockDevices.filter((device) => device.RackKey === selectedRackKey).map((device) => <button key={device.DeviceKey} onClick={() => selectDevice(device)}>{device.DeviceKey}<small>U{device.UPosition} · {device.DeviceType}</small></button>)}</div></details>
          {selectedRack && <details open><summary>Capacity / Occupancy</summary><p>{getUsedU(selectedRack).toFixed(1)}U used · {(selectedRack.RackHeightU - getUsedU(selectedRack)).toFixed(1)}U free · {selectedRack.Occupancy}</p></details>}
          <details open={settingsOpen}><summary>Admin / Column mapping placeholder</summary><div className={styles.settings}><p>RacksListName: {racksListName || mockColumnMappings.racksListName}</p><p>DevicesListName: {devicesListName || mockColumnMappings.devicesListName}</p><label><input type="checkbox" checked={localUseDummyData} onChange={(event) => setLocalUseDummyData(event.currentTarget.checked)} /> UseDummyData</label><h3>Inventory columns</h3>{inventoryColumns.map((column) => <label key={column}><input type="checkbox" checked={visibleColumns.indexOf(column) > -1} onChange={() => setVisibleColumns((current) => current.indexOf(column) > -1 ? current.filter((item) => item !== column) : current.concat(column))} /> {column}</label>)}<p>Mapping: Rack-ID → RackKey, floor → Floor, Location → Location, height unit → RackHeightU, Device ID → DeviceKey, U-Position → UPosition.</p></div></details>
        </aside>
      </div>

      <footer className={styles.tablePanel}><h2>Device inventory</h2><table><thead><tr>{visibleColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{filteredDevices.map((device) => <tr key={device.DeviceKey} className={selectedDeviceKey === device.DeviceKey ? styles.selectedRow : ''} onClick={() => selectDevice(device)}>{visibleColumns.map((column) => <td key={column}>{inventoryValue(column, device)}</td>)}</tr>)}</tbody></table></footer>
    </section>
  );
};

const RackElevation: React.FC<{ rack: IRack; devices: IDevice[]; selectedRackKey?: string; selectedDeviceKey?: string; hasConflict: (device: IDevice, rackDevices: IDevice[]) => boolean; onRackSelected: (rack: IRack) => void; onDeviceSelected: (device: IDevice) => void; }> = ({ rack, devices, selectedRackKey, selectedDeviceKey, hasConflict, onRackSelected, onDeviceSelected }) => (
  <div className={`${styles.rackShell} ${selectedRackKey === rack.RackKey ? styles.selectedRack : ''}`} onClick={() => onRackSelected(rack)}><div className={styles.rackHeader}><strong>{rack.RackKey}</strong><span>{rack.RackHeightU}U</span></div><div className={styles.rackBody}>{Array.from({ length: rack.RackHeightU }).map((_, index) => <span key={index} className={styles.uLabel} style={{ bottom: `${(index / rack.RackHeightU) * 100}%` }}>{index + 1}</span>)}{devices.map((device) => { const width = getWidth(device); const slots = widthSlots[width]; const slot = Math.max(1, Math.min(getSlot(device), slots)); const blockWidth = 100 / slots; const conflict = hasConflict(device, devices); return <button key={device.DeviceKey} className={`${styles.deviceBlock} ${styles[`type${device.DeviceType}`]} ${selectedDeviceKey === device.DeviceKey ? styles.selectedDevice : ''} ${conflict ? styles.conflict : ''}`} style={{ bottom: `${((device.UPosition - 1) / rack.RackHeightU) * 100}%`, height: `${Math.max((getUHeight(device) / rack.RackHeightU) * 100, 2.4)}%`, left: `${(slot - 1) * blockWidth}%`, width: `${blockWidth}%` }} onClick={(event) => { event.stopPropagation(); onDeviceSelected(device); }}><strong>{device.DeviceName || device.DeviceKey}</strong><span>{device.Manufacturer} {device.Model}</span><small>U{device.UPosition}/{getUHeight(device)}U · {device.DeviceType}</small><em>{getSide(device)} · {width} · Slot {slot}</em>{conflict && <b>Overlap</b>}</button>; })}</div></div>
);


const BlockScene: React.FC<{ racks: IRack[]; devices: IDevice[]; selectedRackKey?: string; selectedDeviceKey?: string; offset: { x: number; y: number }; onRackSelected: (rack: IRack) => void; onDeviceSelected: (device: IDevice) => void; }> = ({ racks, devices, selectedRackKey, selectedDeviceKey, offset, onRackSelected, onDeviceSelected }) => (
  <div className={styles.blockScene}><div className={styles.blockFloor} style={{ transform: `translate(${offset.x}px, ${offset.y}px) rotateX(58deg) rotateZ(-28deg)` }}>{racks.map((rack, rackIndex) => <div key={rack.RackKey} className={`${styles.legoRack} ${selectedRackKey === rack.RackKey ? styles.selectedRack : ''}`} style={{ left: `${rackIndex * 210}px` }} onClick={() => onRackSelected(rack)}><strong>{rack.RackKey}</strong>{devices.filter((device) => device.RackKey === rack.RackKey).map((device) => { const width = getWidth(device); const isSelected = selectedDeviceKey === device.DeviceKey; return <button key={device.DeviceKey} className={`${styles.legoDevice} ${styles[`type${device.DeviceType}`]} ${isSelected ? styles.selectedDevice : ''}`} style={{ bottom: `${(device.UPosition - 1) * 6}px`, height: `${Math.max(getUHeight(device) * 16, 24)}px`, width: `${width === 'Full' ? 132 : 64}px`, left: `${width === 'Full' ? 16 : 16 + (getSlot(device) - 1) * 68}px` }} onClick={(event) => { event.stopPropagation(); onDeviceSelected(device); }}><span className={styles.legoDeviceName}>{device.DeviceKey}</span><span className={styles.legoDeviceModel}>{device.Manufacturer} {device.Model}</span><small>U{device.UPosition}/{getUHeight(device)}U · {width} · Slot {getSlot(device)}</small></button>; })}</div>)}</div></div>
);

const RackDetails: React.FC<{ rack: IRack }> = ({ rack }) => <Details rows={{ 'Rack-ID': rack.RackKey, Location: rack.Location, Room: rack.Room, Floor: rack.Floor, RackHeightU: `${rack.RackHeightU}`, Responsible: rack.Responsible, Occupancy: rack.Occupancy, Devices: `${mockDevices.filter((device) => device.RackKey === rack.RackKey).length}`, 'Used U': `${getUsedU(rack).toFixed(1)}`, 'Free U': `${(rack.RackHeightU - getUsedU(rack)).toFixed(1)}`, Notes: rack.Notes || 'No notes in dummy data' }} />;
const DeviceDetails: React.FC<{ device: IDevice; rack?: IRack }> = ({ device, rack }) => <Details rows={{ 'Device ID / DeviceName': `${device.DeviceKey} / ${device.DeviceName}`, 'Device Type': device.DeviceType, Manufacturer: device.Manufacturer || '', Model: device.Model || '', 'Serial Number': device.SerialNumber || '', AssetTag: device.AssetTag || '', 'Rack-ID': device.RackKey, UPosition: `${device.UPosition}`, UHeight: `${getUHeight(device)}`, RackSide: getSide(device), MountWidth: getWidth(device), HorizontalSlot: `${getSlot(device)}`, 'IP Address': device.IPAddress || '', VLAN: device.VLAN || '', 'Power Consumption (W)': `${device.PowerConsumptionW || 0}`, 'Warranty Expiry': device.WarrantyExpiry || '', 'Maintenance Responsible': device.MaintenanceResponsible, Location: rack ? rack.Location : '', Room: rack ? rack.Room : '', Floor: rack ? rack.Floor : '', Notes: device.Notes || 'No notes in dummy data' }} />;
const Details: React.FC<{ rows: { [key: string]: string } }> = ({ rows }) => <dl className={styles.details}>{Object.keys(rows).map((key) => <React.Fragment key={key}><dt>{key}</dt><dd>{rows[key]}</dd></React.Fragment>)}</dl>;
const inventoryValue = (column: string, device: IDevice): string | number => { const rack = getRack(device); const values: { [key: string]: string | number } = { Device: `${device.DeviceKey} / ${device.DeviceName}`, Type: device.DeviceType, Manufacturer: device.Manufacturer || '', Model: device.Model || '', Rack: device.RackKey, Location: rack ? rack.Location : '', Room: rack ? rack.Room : '', Floor: rack ? rack.Floor : '', UPosition: device.UPosition, UHeight: getUHeight(device), Side: getSide(device), Width: getWidth(device), 'IP Address': device.IPAddress || '', VLAN: device.VLAN || '', 'Serial Number': device.SerialNumber || '', 'Warranty Expiry': device.WarrantyExpiry || '', 'Maintenance Responsible': device.MaintenanceResponsible }; return values[column] || ''; };

export default ServerRoomDigitalTwin;
