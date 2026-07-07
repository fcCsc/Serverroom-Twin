import * as React from 'react';
// Final MVP: default experience is the 2D / 2.5D rack visual dashboard.
import styles from './ServerRoomDigitalTwin.module.scss';
import { defaultAppConfiguration, mockDevices, mockRacks } from '../data/mockData';
import { DeviceType, IAppConfiguration, IConnectionValidationResult, IDevice, IListDiscoveryResult, IRack, MountWidth, RackSide } from '../models/ServerRoomModels';
import { IServerRoomDigitalTwinProps } from './IServerRoomDigitalTwinProps';
import { MockDataProvider, MockListDiscoveryService } from '../services/MockDataProvider';
import { SharePointListDataProvider, SharePointListDiscoveryService } from '../services/SharePointListDataProvider';

const deviceTypes: Array<DeviceType | 'All'> = ['All', 'Server', 'Switch', 'Storage', 'Firewall', 'PatchPanel', 'UPS', 'Appliance'];
const inventoryColumns = ['Device', 'Type', 'Manufacturer', 'Model', 'Rack', 'Location', 'Room / Floor', 'UPosition', 'UHeight', 'Side', 'Width', 'IP Address', 'VLAN', 'Serial Number', 'Warranty Expiry', 'Maintenance Responsible'];
const widthSlots: { [key in MountWidth]: number } = { Full: 1, Half: 2, Third: 3, Quarter: 4 };

const getUHeight = (device: IDevice): number => device.UHeight || 1;
const getSide = (device: IDevice): RackSide => device.RackSide || 'Front';
const getWidth = (device: IDevice): MountWidth => device.MountWidth || 'Full';
const getSlot = (device: IDevice): number => device.HorizontalSlot || 1;
const ServerRoomDigitalTwin: React.FC<IServerRoomDigitalTwinProps> = ({ racksListName, devicesListName, useDummyData, currentSiteUrl, spHttpClient }) => {
  const firstRack = mockRacks[0];
  const isPreviewRuntime = !currentSiteUrl || !spHttpClient;
  const [appConfig, setAppConfig] = React.useState<IAppConfiguration>({ ...defaultAppConfiguration, racksListName: racksListName || defaultAppConfiguration.racksListName, devicesListName: devicesListName || defaultAppConfiguration.devicesListName, useDummyData: useDummyData !== false });
  const [racks, setRacks] = React.useState<IRack[]>(mockRacks);
  const [devices, setDevices] = React.useState<IDevice[]>(mockDevices);
  const [listDiscovery, setListDiscovery] = React.useState<IListDiscoveryResult>({ lists: [] });
  const [dataNotice, setDataNotice] = React.useState<string>('');
  const [validationResult, setValidationResult] = React.useState<IConnectionValidationResult | undefined>();
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
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>(appConfig.inventoryVisibleColumns);

  const getRackForDevice = React.useCallback((device: IDevice): IRack | undefined => racks.filter((rack) => rack.RackKey === device.RackKey)[0], [racks]);
  const getUsedUForRack = React.useCallback((rack: IRack): number => devices.filter((device) => device.RackKey === rack.RackKey).reduce((total, device) => total + getUHeight(device) / widthSlots[getWidth(device)], 0), [devices]);

  React.useEffect(() => {
    const service = appConfig.useDummyData || isPreviewRuntime ? new MockListDiscoveryService() : new SharePointListDiscoveryService(spHttpClient as never, currentSiteUrl);
    service.discover().then(setListDiscovery).catch((error: Error) => setDataNotice(error.message));
  }, [appConfig.useDummyData, currentSiteUrl, isPreviewRuntime, spHttpClient]);

  React.useEffect(() => {
    const provider = appConfig.useDummyData || isPreviewRuntime ? new MockDataProvider() : new SharePointListDataProvider(spHttpClient as never, currentSiteUrl);
    provider.loadData(appConfig).then((result) => { setRacks(result.racks); setDevices(result.devices); setDataNotice(result.warning || ''); }).catch((error: Error) => { setDataNotice(`${error.message} Showing safe dummy fallback.`); if (appConfig.allowDummyFallback) { setRacks(mockRacks); setDevices(mockDevices); } });
  }, [appConfig, currentSiteUrl, isPreviewRuntime, spHttpClient]);

  const selectedRack = racks.filter((rack) => rack.RackKey === selectedRackKey)[0];
  const selectedDevice = selectedDeviceKey ? devices.filter((device) => device.DeviceKey === selectedDeviceKey)[0] : undefined;
  const locations = Array.from(new Set(racks.map((rack) => rack.Location)));
  const rooms = Array.from(new Set(racks.filter((rack) => rack.Location === selectedLocation).map((rack) => rack.Room)));
  const scopedRacks = racks.filter((rack) => rack.Location === selectedLocation && (!selectedRoom || rack.Room === selectedRoom) && (selectionScope === 'location' || selectionScope === 'room' || rack.RackKey === selectedRackKey));
  const rackOptions = scopedRacks;
  const areaRacks = scopedRacks.filter((rack) => rackFilter === 'All' || rack.RackKey === rackFilter);
  const areaRackKeys = areaRacks.map((rack) => rack.RackKey);

  const filteredDevices = devices.filter((device) => {
    const rack = getRackForDevice(device);
    const text = `${device.DeviceKey} ${device.DeviceName} ${device.DeviceType} ${device.IPAddress || ''} ${device.VLAN || ''} ${device.SerialNumber || ''} ${device.Manufacturer || ''} ${device.Model || ''} ${rack ? `${rack.RackKey} ${rack.Location} ${rack.Room} ${rack.Floor}` : ''}`.toLowerCase();
    return text.indexOf(search.toLowerCase()) > -1 && (deviceTypeFilter === 'All' || device.DeviceType === deviceTypeFilter) && areaRackKeys.indexOf(device.RackKey) > -1;
  });

  const selectLocation = (location: string): void => {
    const rack = racks.filter((candidate) => candidate.Location === location)[0];
    setSelectedLocation(location);
    setSelectedRoom(undefined);
    setRackFilter('All');
    setSelectionScope('location');
    if (rack) setSelectedRackKey(rack.RackKey);
    setSelectedDeviceKey(undefined);
  };

  const selectRoom = (location: string, room: string): void => {
    const rack = racks.filter((candidate) => candidate.Location === location && candidate.Room === room)[0];
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
    const rack = getRackForDevice(device);
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
        <aside className={styles.sidebar}><h2>Räumlichkeiten</h2>{locations.map((location) => <details key={location} className={styles.locationGroup} open={selectedLocation === location}><summary onClick={(event) => { event.preventDefault(); selectLocation(location); }}>{location}</summary>{Array.from(new Set(racks.filter((rack) => rack.Location === location).map((rack) => rack.Room))).map((room) => { const roomRacks = racks.filter((rack) => rack.Location === location && rack.Room === room); return <details key={room} open={selectedLocation === location && selectedRoom === room}><summary className={styles.floorNav} onClick={(event) => { event.preventDefault(); selectRoom(location, room); }}><span>{room}</span><small>{roomRacks.length} racks</small></summary>{roomRacks.map((rack) => <details key={rack.RackKey} open={selectedRackKey === rack.RackKey}><summary className={styles.rackNav} onClick={(event) => { event.preventDefault(); selectRack(rack); }}><span>{rack.RackKey}</span><small>{devices.filter((device) => device.RackKey === rack.RackKey).length} devices</small></summary>{devices.filter((device) => device.RackKey === rack.RackKey).map((device) => <button key={device.DeviceKey} className={`${styles.deviceNav} ${selectedDeviceKey === device.DeviceKey ? styles.active : ''}`} onClick={() => selectDevice(device)}>{device.DeviceName}</button>)}</details>)}</details>; })}</details>)}</aside>

        <main className={styles.rackView}>{dataNotice && <p className={styles.sceneMessage}>{dataNotice}</p>}<div className={styles.sectionTitle}><h2>{selectedLocation}{selectedRoom ? ` · ${selectedRoom}` : ' · all rooms'}</h2><span>{rackSide} side · {areaRacks.length} rack(s)</span></div>{viewMode === 'blocks' && <div className={styles.sceneControls}><button onClick={() => setSceneOffset({ x: sceneOffset.x - 24, y: sceneOffset.y })}>←</button><button onClick={() => setSceneOffset({ x: sceneOffset.x + 24, y: sceneOffset.y })}>→</button><button onClick={() => setSceneOffset({ x: sceneOffset.x, y: sceneOffset.y - 18 })}>↑</button><button onClick={() => setSceneOffset({ x: sceneOffset.x, y: sceneOffset.y + 18 })}>↓</button><button onClick={() => setSceneOffset({ x: 0, y: 0 })}>Reset</button></div>}{viewMode === 'elevation' ? <div className={styles.rackCanvas}>{areaRacks.map((rack) => <RackElevation key={rack.RackKey} rack={rack} devices={filteredDevices.filter((device) => device.RackKey === rack.RackKey && getSide(device) === rackSide)} selectedRackKey={selectedRackKey} selectedDeviceKey={selectedDeviceKey} hasConflict={hasConflict} onRackSelected={selectRack} onDeviceSelected={selectDevice} />)}</div> : <BlockScene racks={areaRacks} devices={filteredDevices.filter((device) => getSide(device) === rackSide)} selectedRackKey={selectedRackKey} selectedDeviceKey={selectedDeviceKey} offset={sceneOffset} onRackSelected={selectRack} onDeviceSelected={selectDevice} />}</main>

        <aside className={styles.detailPanel}><h2>{selectedDevice ? 'Device details' : 'Rack details'}</h2>{selectedDevice ? <DeviceDetails device={selectedDevice} rack={getRackForDevice(selectedDevice)} /> : selectedRack && <RackDetails rack={selectedRack} devices={devices} usedU={getUsedUForRack(selectedRack)} />}
          <details open><summary>Devices in selected rack</summary><div className={styles.miniList}>{devices.filter((device) => device.RackKey === selectedRackKey).map((device) => <button key={device.DeviceKey} onClick={() => selectDevice(device)}>{device.DeviceKey}<small>U{device.UPosition} · {device.DeviceType}</small></button>)}</div></details>
          {selectedRack && <details open><summary>Capacity / Occupancy</summary><p>{getUsedUForRack(selectedRack).toFixed(1)}U used · {(selectedRack.RackHeightU - getUsedUForRack(selectedRack)).toFixed(1)}U free · {selectedRack.Occupancy}</p></details>}
          <SettingsPanel open={settingsOpen} config={appConfig} listDiscovery={listDiscovery} validationResult={validationResult} visibleColumns={visibleColumns} onConfigChange={setAppConfig} onVisibleColumnsChange={setVisibleColumns} onTestConnection={() => setValidationResult(validateConfiguration(appConfig, listDiscovery, racks, devices))} />
        </aside>
      </div>

      <footer className={styles.tablePanel}><h2>Device inventory</h2><table><thead><tr>{visibleColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{filteredDevices.map((device) => <tr key={device.DeviceKey} className={selectedDeviceKey === device.DeviceKey ? styles.selectedRow : ''} onClick={() => selectDevice(device)}>{visibleColumns.map((column) => <td key={column}>{inventoryValue(column, device, getRackForDevice(device))}</td>)}</tr>)}</tbody></table></footer>
    </section>
  );
};

const RackElevation: React.FC<{ rack: IRack; devices: IDevice[]; selectedRackKey?: string; selectedDeviceKey?: string; hasConflict: (device: IDevice, rackDevices: IDevice[]) => boolean; onRackSelected: (rack: IRack) => void; onDeviceSelected: (device: IDevice) => void; }> = ({ rack, devices, selectedRackKey, selectedDeviceKey, hasConflict, onRackSelected, onDeviceSelected }) => (
  <div className={`${styles.rackShell} ${selectedRackKey === rack.RackKey ? styles.selectedRack : ''}`} onClick={() => onRackSelected(rack)}><div className={styles.rackHeader}><strong>{rack.RackKey}</strong><span>{rack.RackHeightU}U</span></div><div className={styles.rackBody}>{Array.from({ length: rack.RackHeightU }).map((_, index) => <span key={index} className={styles.uLabel} style={{ bottom: `${(index / rack.RackHeightU) * 100}%` }}>{index + 1}</span>)}{devices.map((device) => { const width = getWidth(device); const slots = widthSlots[width]; const slot = Math.max(1, Math.min(getSlot(device), slots)); const blockWidth = 100 / slots; const conflict = hasConflict(device, devices); return <button key={device.DeviceKey} className={`${styles.deviceBlock} ${styles[`type${device.DeviceType}`]} ${selectedDeviceKey === device.DeviceKey ? styles.selectedDevice : ''} ${conflict ? styles.conflict : ''}`} style={{ bottom: `${((device.UPosition - 1) / rack.RackHeightU) * 100}%`, height: `${Math.max((getUHeight(device) / rack.RackHeightU) * 100, 2.4)}%`, left: `${(slot - 1) * blockWidth}%`, width: `${blockWidth}%` }} onClick={(event) => { event.stopPropagation(); onDeviceSelected(device); }}><strong>{device.DeviceName || device.DeviceKey}</strong><span>{device.Manufacturer} {device.Model}</span><small>U{device.UPosition}/{getUHeight(device)}U · {device.DeviceType}</small><em>{getSide(device)} · {width} · Slot {slot}</em>{conflict && <b>Overlap</b>}</button>; })}</div></div>
);


const BlockScene: React.FC<{ racks: IRack[]; devices: IDevice[]; selectedRackKey?: string; selectedDeviceKey?: string; offset: { x: number; y: number }; onRackSelected: (rack: IRack) => void; onDeviceSelected: (device: IDevice) => void; }> = ({ racks, devices, selectedRackKey, selectedDeviceKey, offset, onRackSelected, onDeviceSelected }) => (
  <div className={styles.blockScene}><div className={styles.blockFloor} style={{ transform: `translate(${offset.x}px, ${offset.y}px) rotateX(58deg) rotateZ(-28deg)` }}>{racks.map((rack, rackIndex) => <div key={rack.RackKey} className={`${styles.legoRack} ${selectedRackKey === rack.RackKey ? styles.selectedRack : ''}`} style={{ left: `${rackIndex * 210}px` }} onClick={() => onRackSelected(rack)}><strong>{rack.RackKey}</strong>{devices.filter((device) => device.RackKey === rack.RackKey).map((device) => { const width = getWidth(device); const isSelected = selectedDeviceKey === device.DeviceKey; return <button key={device.DeviceKey} className={`${styles.legoDevice} ${styles[`type${device.DeviceType}`]} ${isSelected ? styles.selectedDevice : ''}`} style={{ bottom: `${(device.UPosition - 1) * 6}px`, height: `${Math.max(getUHeight(device) * 16, 24)}px`, width: `${width === 'Full' ? 132 : 64}px`, left: `${width === 'Full' ? 16 : 16 + (getSlot(device) - 1) * 68}px` }} onClick={(event) => { event.stopPropagation(); onDeviceSelected(device); }}><span className={styles.legoDeviceName}>{device.DeviceKey}</span><span className={styles.legoDeviceModel}>{device.Manufacturer} {device.Model}</span><small>U{device.UPosition}/{getUHeight(device)}U · {width} · Slot {getSlot(device)}</small></button>; })}</div>)}</div></div>
);

const RackDetails: React.FC<{ rack: IRack; devices: IDevice[]; usedU: number }> = ({ rack, devices, usedU }) => <Details rows={{ 'Rack-ID': rack.RackKey, Location: rack.Location, Room: rack.Room, Floor: rack.Floor, RackHeightU: `${rack.RackHeightU}`, Responsible: rack.Responsible, Occupancy: rack.Occupancy, Devices: `${devices.filter((device) => device.RackKey === rack.RackKey).length}`, 'Used U': `${usedU.toFixed(1)}`, 'Free U': `${(rack.RackHeightU - usedU).toFixed(1)}`, Notes: rack.Notes || 'No notes in dummy data' }} />;
const DeviceDetails: React.FC<{ device: IDevice; rack?: IRack }> = ({ device, rack }) => <Details rows={{ 'Device ID / DeviceName': `${device.DeviceKey} / ${device.DeviceName}`, 'Device Type': device.DeviceType, Manufacturer: device.Manufacturer || '', Model: device.Model || '', 'Serial Number': device.SerialNumber || '', AssetTag: device.AssetTag || '', 'Rack-ID': device.RackKey, UPosition: `${device.UPosition}`, UHeight: `${getUHeight(device)}`, RackSide: getSide(device), MountWidth: getWidth(device), HorizontalSlot: `${getSlot(device)}`, 'IP Address': device.IPAddress || '', VLAN: device.VLAN || '', 'Power Consumption (W)': `${device.PowerConsumptionW || 0}`, 'Warranty Expiry': device.WarrantyExpiry || '', 'Maintenance Responsible': device.MaintenanceResponsible, Location: rack ? rack.Location : '', Room: rack ? rack.Room : '', Floor: rack ? rack.Floor : '', Notes: device.Notes || 'No notes in dummy data' }} />;
const Details: React.FC<{ rows: { [key: string]: string } }> = ({ rows }) => <dl className={styles.details}>{Object.keys(rows).map((key) => <React.Fragment key={key}><dt>{key}</dt><dd>{rows[key]}</dd></React.Fragment>)}</dl>;
const inventoryValue = (column: string, device: IDevice, rack?: IRack): string | number => { const values: { [key: string]: string | number } = { Device: `${device.DeviceKey} / ${device.DeviceName}`, Type: device.DeviceType, Manufacturer: device.Manufacturer || '', Model: device.Model || '', Rack: device.RackKey, Location: rack ? rack.Location : '', 'Room / Floor': rack ? `${rack.Room} / ${rack.Floor}` : '', UPosition: device.UPosition, UHeight: getUHeight(device), Side: getSide(device), Width: getWidth(device), 'IP Address': device.IPAddress || '', VLAN: device.VLAN || '', 'Serial Number': device.SerialNumber || '', 'Warranty Expiry': device.WarrantyExpiry || '', 'Maintenance Responsible': device.MaintenanceResponsible }; return values[column] || ''; };


const columnNames = (listDiscovery: IListDiscoveryResult, listName: string): string[] => {
  const list = listDiscovery.lists.filter((candidate) => candidate.title === listName)[0];
  return list ? list.fields.map((field) => field.title) : [];
};

const SettingsPanel: React.FC<{ open: boolean; config: IAppConfiguration; listDiscovery: IListDiscoveryResult; validationResult?: IConnectionValidationResult; visibleColumns: string[]; onConfigChange: (config: IAppConfiguration) => void; onVisibleColumnsChange: (columns: string[]) => void; onTestConnection: () => void; }> = ({ open, config, listDiscovery, validationResult, visibleColumns, onConfigChange, onVisibleColumnsChange, onTestConnection }) => {
  if (!open) return null;
  const listNames = listDiscovery.lists.map((list) => list.title);
  const rackFields = columnNames(listDiscovery, config.racksListName);
  const deviceFields = columnNames(listDiscovery, config.devicesListName);
  const updateRackMapping = (key: keyof IAppConfiguration['columnMappings']['racks'], value: string): void => onConfigChange({ ...config, columnMappings: { ...config.columnMappings, racks: { ...config.columnMappings.racks, [key]: value } } });
  const updateDeviceMapping = (key: keyof IAppConfiguration['columnMappings']['devices'], value: string): void => onConfigChange({ ...config, columnMappings: { ...config.columnMappings, devices: { ...config.columnMappings.devices, [key]: value } } });
  const fieldSelect = (value: string | undefined, fields: string[], onChange: (value: string) => void): JSX.Element => <select value={value || ''} onChange={(event) => onChange(event.currentTarget.value)}><option value="">Optional / default</option>{fields.map((field) => <option key={field} value={field}>{field}</option>)}</select>;
  const toggleColumn = (column: string): void => onVisibleColumnsChange(visibleColumns.indexOf(column) > -1 ? visibleColumns.filter((item) => item !== column) : visibleColumns.concat(column));

  return <section className={styles.settingsPanel}><h2>Data Source Setup</h2><p>Production runs from SharePoint Lists. GitHub preview stays dummy-data-only.</p><h3>Mode</h3><label><input type="radio" checked={config.useDummyData} onChange={() => onConfigChange({ ...config, useDummyData: true })} /> Use dummy data</label><label><input type="radio" checked={!config.useDummyData} onChange={() => onConfigChange({ ...config, useDummyData: false })} /> Use SharePoint Lists</label><h3>Lists</h3><label>Racks List selector<select value={config.racksListName} onChange={(event) => onConfigChange({ ...config, racksListName: event.currentTarget.value })}>{listNames.map((listName) => <option key={listName} value={listName}>{listName}</option>)}</select></label><label>Devices List selector<select value={config.devicesListName} onChange={(event) => onConfigChange({ ...config, devicesListName: event.currentTarget.value })}>{listNames.map((listName) => <option key={listName} value={listName}>{listName}</option>)}</select></label><h3>Rack column mapping</h3>{(Object.keys(config.columnMappings.racks) as Array<keyof IAppConfiguration['columnMappings']['racks']>).map((key) => <label key={key}>{key} {fieldSelect(config.columnMappings.racks[key], rackFields, (value) => updateRackMapping(key, value))}</label>)}<h3>Device column mapping</h3>{(Object.keys(config.columnMappings.devices) as Array<keyof IAppConfiguration['columnMappings']['devices']>).map((key) => <label key={key}>{key} {fieldSelect(config.columnMappings.devices[key], deviceFields, (value) => updateDeviceMapping(key, value))}</label>)}<h3>Defaults</h3><label>Default UHeight<input type="number" min="1" value={config.defaultUHeight} onChange={(event) => onConfigChange({ ...config, defaultUHeight: Number(event.currentTarget.value) || 1 })} /></label><label>Default RackSide<select value={config.defaultRackSide} onChange={(event) => onConfigChange({ ...config, defaultRackSide: event.currentTarget.value as RackSide })}><option>Front</option><option>Rear</option></select></label><label>Default MountWidth<select value={config.defaultMountWidth} onChange={(event) => onConfigChange({ ...config, defaultMountWidth: event.currentTarget.value as MountWidth })}><option>Full</option><option>Half</option><option>Third</option><option>Quarter</option></select></label><label><input type="checkbox" checked={config.allowDummyFallback} onChange={(event) => onConfigChange({ ...config, allowDummyFallback: event.currentTarget.checked })} /> Allow dummy fallback if SharePoint loading fails</label><h3>Inventory visible columns</h3><div className={styles.columnToggleGrid}>{inventoryColumns.map((column) => <label key={column}><input type="checkbox" checked={visibleColumns.indexOf(column) > -1} onChange={() => toggleColumn(column)} /> {column}</label>)}</div><div className={styles.settingsActions}><button onClick={onTestConnection}>Test connection</button><button onClick={() => onConfigChange({ ...config, inventoryVisibleColumns: visibleColumns })}>Save local configuration</button></div><p>Config list readiness: {config.configListName}. Persistence service is structured for this list; this PR keeps local state fallback as the safe default.</p>{validationResult && <div className={validationResult.ok ? styles.validationOk : styles.validationNotice}>{validationResult.messages.map((message) => <p key={message}>{message}</p>)}</div>}</section>;
};

const validateConfiguration = (config: IAppConfiguration, discovery: IListDiscoveryResult, racks: IRack[], devices: IDevice[]): IConnectionValidationResult => {
  const messages: string[] = [];
  const racksList = discovery.lists.filter((list) => list.title === config.racksListName)[0];
  const devicesList = discovery.lists.filter((list) => list.title === config.devicesListName)[0];
  if (!racksList) messages.push(`Racks list '${config.racksListName}' was not found.`);
  if (!devicesList) messages.push(`Devices list '${config.devicesListName}' was not found.`);
  const hasField = (fields: string[], field: string | undefined): boolean => !field || fields.indexOf(field) > -1;
  const rackFields = racksList ? racksList.fields.map((field) => field.title) : [];
  const deviceFields = devicesList ? devicesList.fields.map((field) => field.title) : [];
  ['RackKey', 'Location', 'Floor', 'RackHeightU'].forEach((key) => { const field = config.columnMappings.racks[key as keyof IAppConfiguration['columnMappings']['racks']]; if (!hasField(rackFields, field)) messages.push(`Mapped rack column '${field}' for ${key} was not found.`); });
  ['DeviceKey', 'RackKey', 'UPosition', 'DeviceType'].forEach((key) => { const field = config.columnMappings.devices[key as keyof IAppConfiguration['columnMappings']['devices']]; if (!hasField(deviceFields, field)) messages.push(`Mapped device column '${field}' for ${key} was not found.`); });
  if (racks.some((rack) => !Number.isFinite(rack.RackHeightU))) messages.push('RackHeightU must be numeric.');
  if (devices.some((device) => !Number.isFinite(device.UPosition))) messages.push('UPosition must be numeric.');
  if (devices.some((device) => racks.filter((rack) => rack.RackKey === device.RackKey).length === 0)) messages.push('At least one device RackKey does not match a rack RackKey.');
  if (messages.length === 0) messages.push('Connection settings look valid. Optional missing columns will use safe defaults.');
  return { ok: messages.length === 1 && messages[0].indexOf('valid') > -1, messages };
};

export default ServerRoomDigitalTwin;
