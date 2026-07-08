import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import { mockDevices, mockRacks, mockRooms } from '../data/mockData';
import { IDevice, IRack, IRoom, DeviceType, MountWidth, RackSide } from '../models/ServerRoomModels';
import { IServerRoomDigitalTwinProps } from './IServerRoomDigitalTwinProps';

const rackSideOptions: RackSide[] = ['Front', 'Rear'];
const deviceTypes: DeviceType[] = ['Switch', 'Server', 'Firewall', 'Storage', 'UPS', 'PatchPanel'];
const inventoryColumns = ['manufacturer', 'model', 'rack', 'location', 'floor', 'uPosition', 'uHeight', 'side', 'width', 'ip', 'vlan', 'serial', 'warranty', 'maintenance'];

const typeLabels: { [key in DeviceType]: string } = {
  Switch: 'Switch',
  Server: 'Server',
  Firewall: 'Firewall',
  Storage: 'Storage',
  UPS: 'UPS',
  PatchPanel: 'Patch Panel'
};

const widthPercent: { [key in MountWidth]: number } = {
  Full: 100,
  Half: 50,
  Third: 33.333,
  Quarter: 25
};

const getLocation = (room: IRoom): string => room.Location || 'Demo Campus';
const getFloor = (room: IRoom): string => room.Floor || 'Floor 1';
const getRackHeight = (rack: IRack): number => rack.RackHeightU || 42;
const getDeviceHeight = (device: IDevice): number => device.UHeight || 1;
const getDeviceSide = (device: IDevice): RackSide => device.RackSide || 'Front';
const getDeviceWidth = (device: IDevice): MountWidth => device.MountWidth || 'Full';
const getDeviceSlot = (device: IDevice): number => device.HorizontalSlot || 1;
const getDeviceLeft = (device: IDevice): number => {
  const width = widthPercent[getDeviceWidth(device)];
  return Math.max(0, Math.min(100 - width, (getDeviceSlot(device) - 1) * width));
};
const getUsedU = (devices: IDevice[]): number => {
  const units: { [key: number]: boolean } = {};
  devices.forEach((device) => {
    for (let offset = 0; offset < getDeviceHeight(device); offset++) units[device.UPosition + offset] = true;
  });
  return Object.keys(units).length;
};
const getOccupancy = (rack: IRack, devices: IDevice[]): number => Math.min(100, Math.round((getUsedU(devices) / getRackHeight(rack)) * 100));
const hasPlacementConflict = (device: IDevice, devices: IDevice[]): boolean => devices.some((candidate) => candidate.DeviceKey !== device.DeviceKey && candidate.RackKey === device.RackKey && getDeviceSide(candidate) === getDeviceSide(device) && candidate.UPosition === device.UPosition && (getDeviceWidth(candidate) === 'Full' || getDeviceWidth(device) === 'Full'));

const ServerRoomDigitalTwin: React.FC<IServerRoomDigitalTwinProps> = ({ racksListName, devicesListName, modelAssetsListName, deviceTypeAssetMappingsListName, assetLibraryPath, useDummyData }) => {
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
  const [selectedRackKey, setSelectedRackKey] = React.useState<string>(visibleRacks[0].RackKey);
  const [selectedDeviceKey, setSelectedDeviceKey] = React.useState<string | undefined>();
  const [rackSide, setRackSide] = React.useState<RackSide>('Front');
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = React.useState<{ [key: string]: boolean }>(inventoryColumns.reduce((columns, column) => ({ ...columns, [column]: true }), {}));

  React.useEffect(() => {
    const nextFloors = Array.from(new Set(rooms.filter((room) => getLocation(room) === selectedLocation).map(getFloor)));
    if (nextFloors.indexOf(selectedFloor) === -1) setSelectedFloor(nextFloors[0]);
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
  const sideDevices = areaDevices.filter((device) => getDeviceSide(device) === rackSide);
  const selectedRackDevices = selectedRack ? sideDevices.filter((device) => device.RackKey === selectedRack.RackKey) : [];
  const selectedRackAllDevices = selectedRack ? devices.filter((device) => device.RackKey === selectedRack.RackKey) : [];
  const selectedRackUsedU = getUsedU(selectedRackAllDevices);
  const selectedRackHeight = selectedRack ? getRackHeight(selectedRack) : 42;

  const onRackSelected = (rackKey: string): void => {
    setSelectedRackKey(rackKey);
    setSelectedDeviceKey(undefined);
  };

  const onDeviceSelected = (device: IDevice): void => {
    setSelectedRackKey(device.RackKey);
    setSelectedDeviceKey(device.DeviceKey);
  };

  const toggleColumn = (column: string): void => setVisibleColumns({ ...visibleColumns, [column]: !visibleColumns[column] });

  return (
    <section className={styles.digitalTwin}>
      <header className={styles.header}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>SharePoint-list-ready rack documentation</span>
          <h1>Rack Elevation Navigator</h1>
          <p>Premium dummy-data preview for documenting rack placement, device inventory, capacity and future SharePoint List column mapping.</p>
        </div>
        <div className={styles.headerControls}>
          <div className={styles.sideToggle} aria-label="Rack side toggle">
            {rackSideOptions.map((side) => <button key={side} className={rackSide === side ? styles.activeToggle : ''} onClick={() => setRackSide(side)}>{side}</button>)}
          </div>
          <button className={styles.adminButton} onClick={() => setSettingsOpen(!settingsOpen)}>{settingsOpen ? 'Close admin settings' : 'Admin settings'}</button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <h2>Navigation</h2>
          <p className={styles.navHint}>Location → Floor → Rack</p>
          {locations.map((location) => (
            <div key={location} className={styles.locationGroup}>
              <button className={`${styles.roomNav} ${selectedLocation === location ? styles.active : ''}`} onClick={() => setSelectedLocation(location)}>{location}</button>
              {selectedLocation === location && Array.from(new Set(rooms.filter((room) => getLocation(room) === location).map(getFloor))).map((floor) => (
                <div key={floor} className={styles.floorGroup}>
                  <button className={`${styles.floorNav} ${selectedFloor === floor ? styles.active : ''}`} onClick={() => setSelectedFloor(floor)}>{floor}</button>
                  {selectedFloor === floor && visibleRacks.map((rack) => <button key={rack.RackKey} className={`${styles.rackNav} ${selectedRackKey === rack.RackKey ? styles.active : ''}`} onClick={() => onRackSelected(rack.RackKey)}><span>{rack.Title}</span><em>{getRackHeight(rack)}U</em></button>)}
                </div>
              ))}
            </div>
          ))}
          <div className={styles.legend}>
            <h3>Device marking</h3>
            {deviceTypes.map((type) => <span key={type} className={`${styles.legendItem} ${styles[`type${type}`]}`}><i />{typeLabels[type]}</span>)}
          </div>
        </aside>

        <main className={styles.rackView}>
          <section className={styles.overviewSection}>
            <div className={styles.sectionTitle}><div><span className={styles.eyebrow}>{selectedLocation} • {selectedFloor}</span><h2>Rack overview</h2></div><span>{visibleRacks.length} racks • {rackSide} side</span></div>
            <div className={styles.rackOverviewRail}>
              {visibleRacks.map((rack) => <RackOverviewCard key={rack.RackKey} rack={rack} devices={sideDevices.filter((device) => device.RackKey === rack.RackKey)} selected={selectedRackKey === rack.RackKey} onRackSelected={onRackSelected} />)}
            </div>
          </section>

          {selectedRack && <section className={styles.inspectorSection}>
            <div className={styles.inspectorHeader}><div><span className={styles.eyebrow}>Selected rack inspector</span><h2>{selectedRack.Title}</h2><p>{selectedRack.Responsible || 'Demo team'} • {selectedRackDevices.length} visible devices on {rackSide}</p></div><div className={styles.capacityPill}><strong>{getOccupancy(selectedRack, selectedRackAllDevices)}%</strong><span>occupied</span></div></div>
            <RackInspector rack={selectedRack} devices={selectedRackDevices} allRackDevices={selectedRackAllDevices} selectedDeviceKey={selectedDeviceKey} onDeviceSelected={onDeviceSelected} />
          </section>}
        </main>

        <aside className={`${styles.detailPanel} ${selectedDevice ? styles.deviceDetailActive : ''}`}>
          <details open className={styles.detailSection}><summary>Rack overview</summary>{selectedRack && <Details rows={{ 'Rack ID': selectedRack.RackKey, Location: selectedLocation, Floor: selectedFloor, Row: selectedRack.RowLabel, Number: selectedRack.RackNumber, Height: `${selectedRackHeight}U`, Side: rackSide, Occupancy: `${getOccupancy(selectedRack, selectedRackAllDevices)}%`, 'Device count': `${selectedRackAllDevices.length}`, 'Used U': `${selectedRackUsedU}U`, 'Free U': `${Math.max(selectedRackHeight - selectedRackUsedU, 0)}U`, Responsible: selectedRack.Responsible || 'Demo team', Notes: selectedRack.Notes }} />}</details>
          <details open className={styles.detailSection}><summary>Selected device</summary>{selectedDevice ? <Details rows={{ 'Device ID / name': selectedDevice.Title, 'Device Type': typeLabels[selectedDevice.DeviceType], Manufacturer: selectedDevice.Manufacturer || 'Demo manufacturer', Model: selectedDevice.Model || 'Demo model', 'Serial Number': selectedDevice.SerialNumber || 'Demo serial', AssetTag: selectedDevice.AssetTag || 'Demo asset tag', 'Rack-ID': selectedDevice.RackKey, UPosition: `U${selectedDevice.UPosition}`, UHeight: `${getDeviceHeight(selectedDevice)}U`, RackSide: getDeviceSide(selectedDevice), MountWidth: getDeviceWidth(selectedDevice), HorizontalSlot: `${getDeviceSlot(selectedDevice)}`, 'IP Address': selectedDevice.IPAddress || 'Demo IP only', VLAN: selectedDevice.VLAN || 'Demo VLAN', 'Power Consumption (W)': `${selectedDevice.PowerConsumptionW || 0}`, 'Warranty Expiry': selectedDevice.WarrantyExpiry || 'Demo warranty', 'Maintenance Responsible': selectedDevice.MaintenanceResponsible || selectedDevice.Owner, Notes: selectedDevice.Notes }} /> : <p className={styles.panelHint}>Select a hardware faceplate in the rack inspector to inspect device documentation.</p>}</details>
          <details open className={styles.detailSection}><summary>Capacity</summary><Details rows={{ 'Rack height': `${selectedRackHeight}U`, 'Used U': `${selectedRackUsedU}U`, 'Free U': `${Math.max(selectedRackHeight - selectedRackUsedU, 0)}U`, 'Front devices': `${selectedRackAllDevices.filter((device) => getDeviceSide(device) === 'Front').length}`, 'Rear devices': `${selectedRackAllDevices.filter((device) => getDeviceSide(device) === 'Rear').length}` }} /></details>
          {settingsOpen && <AdminSettings visibleColumns={visibleColumns} toggleColumn={toggleColumn} racksListName={racksListName} devicesListName={devicesListName} modelAssetsListName={modelAssetsListName} deviceTypeAssetMappingsListName={deviceTypeAssetMappingsListName} assetLibraryPath={assetLibraryPath} useDummyData={useDummyData} />}
        </aside>
      </div>

      <footer className={styles.tablePanel}>
        <div className={styles.inventoryHeader}><div><span className={styles.eyebrow}>Documentation table</span><h2>Inventory</h2></div><span>{sideDevices.length} dummy devices shown</span></div>
        <table><thead><tr><th>Device</th><th>Type</th>{visibleColumns.manufacturer && <th>Manufacturer</th>}{visibleColumns.model && <th>Model</th>}{visibleColumns.rack && <th>Rack</th>}{visibleColumns.location && <th>Location</th>}{visibleColumns.floor && <th>Floor</th>}{visibleColumns.uPosition && <th>UPosition</th>}{visibleColumns.uHeight && <th>UHeight</th>}{visibleColumns.side && <th>Side</th>}{visibleColumns.width && <th>Width</th>}{visibleColumns.ip && <th>IP Address</th>}{visibleColumns.vlan && <th>VLAN</th>}{visibleColumns.serial && <th>Serial Number</th>}{visibleColumns.warranty && <th>Warranty Expiry</th>}{visibleColumns.maintenance && <th>Maintenance Responsible</th>}</tr></thead><tbody>
          {sideDevices.map((device) => {
            const rack = racks.filter((candidate) => candidate.RackKey === device.RackKey)[0];
            const room = rack ? rooms.filter((candidate) => candidate.RoomKey === rack.RoomKey)[0] : undefined;
            return <tr key={device.DeviceKey} className={selectedDeviceKey === device.DeviceKey ? styles.selectedRow : ''} onClick={() => onDeviceSelected(device)}><td>{device.Title}</td><td>{typeLabels[device.DeviceType]}</td>{visibleColumns.manufacturer && <td>{device.Manufacturer}</td>}{visibleColumns.model && <td>{device.Model}</td>}{visibleColumns.rack && <td>{rack ? rack.Title : device.RackKey}</td>}{visibleColumns.location && <td>{room ? getLocation(room) : selectedLocation}</td>}{visibleColumns.floor && <td>{room ? getFloor(room) : selectedFloor}</td>}{visibleColumns.uPosition && <td>U{device.UPosition}</td>}{visibleColumns.uHeight && <td>{getDeviceHeight(device)}U</td>}{visibleColumns.side && <td>{getDeviceSide(device)}</td>}{visibleColumns.width && <td>{getDeviceWidth(device)}</td>}{visibleColumns.ip && <td>{device.IPAddress}</td>}{visibleColumns.vlan && <td>{device.VLAN}</td>}{visibleColumns.serial && <td>{device.SerialNumber}</td>}{visibleColumns.warranty && <td>{device.WarrantyExpiry}</td>}{visibleColumns.maintenance && <td>{device.MaintenanceResponsible}</td>}</tr>;
          })}
        </tbody></table>
      </footer>
    </section>
  );
};

const RackOverviewCard: React.FC<{ rack: IRack; devices: IDevice[]; selected: boolean; onRackSelected: (rackKey: string) => void; }> = ({ rack, devices, selected, onRackSelected }) => {
  const occupancy = getOccupancy(rack, devices);
  return <button className={`${styles.overviewCard} ${selected ? styles.selectedOverviewCard : ''}`} onClick={() => onRackSelected(rack.RackKey)}><div><strong>{rack.Title}</strong><span>{getRackHeight(rack)}U • {devices.length} devices</span></div><MiniRack rack={rack} devices={devices} /><small>{occupancy}% occupied</small></button>;
};

const MiniRack: React.FC<{ rack: IRack; devices: IDevice[] }> = ({ rack, devices }) => <div className={styles.miniRack}>{devices.map((device) => <span key={device.DeviceKey} className={styles[`type${device.DeviceType}`]} style={{ bottom: `${((device.UPosition - 1) / getRackHeight(rack)) * 100}%`, height: `${Math.max((getDeviceHeight(device) / getRackHeight(rack)) * 100, 3)}%`, left: `${getDeviceLeft(device)}%`, width: `${widthPercent[getDeviceWidth(device)]}%` }} />)}</div>;

const RackInspector: React.FC<{ rack: IRack; devices: IDevice[]; allRackDevices: IDevice[]; selectedDeviceKey?: string; onDeviceSelected: (device: IDevice) => void; }> = ({ rack, devices, allRackDevices, selectedDeviceKey, onDeviceSelected }) => {
  const rackHeight = getRackHeight(rack);
  const units = Array.from({ length: rackHeight }, (_, index) => rackHeight - index);
  return <div className={styles.inspectorShell} style={{ ['--rack-units' as string]: rackHeight }}><div className={styles.uRail}>{units.map((unit) => <span key={unit} className={unit % 5 === 0 ? styles.majorUnit : ''}>U{unit}</span>)}</div><div className={styles.cabinet}>{units.map((unit) => <span key={unit} className={unit % 5 === 0 ? styles.majorBand : ''} />)}{devices.map((device) => {
    const height = getDeviceHeight(device);
    const top = ((rackHeight - device.UPosition - height + 1) / rackHeight) * 100;
    const conflict = hasPlacementConflict(device, allRackDevices);
    return <button key={device.DeviceKey} className={`${styles.faceplate} ${styles[`type${device.DeviceType}`]} ${selectedDeviceKey === device.DeviceKey ? styles.selectedDevice : ''} ${conflict ? styles.conflictDevice : ''}`} style={{ top: `${top}%`, height: `${Math.max(height * 32, 30)}px`, left: `${getDeviceLeft(device)}%`, width: `${widthPercent[getDeviceWidth(device)]}%` }} onClick={(event) => { event.stopPropagation(); onDeviceSelected(device); }}><span className={styles.deviceMeta}>{typeLabels[device.DeviceType]}</span><strong>{device.Title}</strong><em>{device.Manufacturer} • {device.Model}</em><span className={styles.deviceBadges}><i>U{device.UPosition} / {height}U</i><i>{getDeviceSide(device)}</i><i>{getDeviceWidth(device)} · Slot {getDeviceSlot(device)}</i>{conflict && <i>Conflict</i>}</span><span className={styles.deviceTooltip}>IP {device.IPAddress} · VLAN {device.VLAN} · SN {device.SerialNumber} · Warranty {device.WarrantyExpiry}</span></button>;
  })}</div></div>;
};

const AdminSettings: React.FC<{ visibleColumns: { [key: string]: boolean }; toggleColumn: (column: string) => void; racksListName?: string; devicesListName?: string; modelAssetsListName?: string; deviceTypeAssetMappingsListName?: string; assetLibraryPath?: string; useDummyData?: boolean; }> = ({ visibleColumns, toggleColumn, racksListName, devicesListName, modelAssetsListName, deviceTypeAssetMappingsListName, assetLibraryPath, useDummyData }) => (
  <details open className={`${styles.detailSection} ${styles.settings}`}><summary>SharePoint mapping / admin</summary><p className={styles.settingsIntro}>Production data will be loaded from SharePoint Lists. Preview uses dummy data only.</p><div className={styles.adminGrid}><div><h3>Configuration</h3><Details rows={{ 'Racks list name': racksListName || 'Racks', 'Devices list name': devicesListName || 'Devices', 'Model assets list': modelAssetsListName || 'Model Assets', 'Device mappings list': deviceTypeAssetMappingsListName || 'DeviceTypeAssetMappings', 'Asset library path': assetLibraryPath || 'Site Assets/ServerRoomAssets', 'Use dummy data': useDummyData ? 'Yes' : 'Yes for preview' }} /></div><div><h3>Visible inventory columns</h3><div className={styles.toggleGrid}>{inventoryColumns.map((column) => <label key={column}><input type="checkbox" checked={visibleColumns[column]} onChange={() => toggleColumn(column)} /> <span>{column}</span></label>)}</div></div></div><div className={styles.mappingGrid}><div><h3>Racks</h3><p>Rack-ID → RackKey</p><p>floor → Floor</p><p>Location → Location</p><p>height unit → RackHeightU</p><p>Responsible → Responsible</p><p>Occupancy → Occupancy</p></div><div><h3>Devices</h3><p>Device ID → DeviceKey / DeviceName</p><p>Rack-ID → RackKey</p><p>U-Position → UPosition</p><p>Device Type → DeviceType</p><p>IP Address → IPAddress</p><p>VLAN → VLAN</p><p>Power Consumption (W) → PowerConsumptionW</p><p>Serial Number → SerialNumber</p><p>Warranty Expiry → WarrantyExpiry</p><p>Maintenance Responsible → MaintenanceResponsible</p></div><div><h3>Future optional fields</h3><p>UHeight</p><p>Manufacturer</p><p>Model</p><p>AssetTag</p><p>RackSide</p><p>MountWidth</p><p>HorizontalSlot</p><p>Notes</p></div></div></details>
);

const Details: React.FC<{ rows: { [key: string]: string } }> = ({ rows }) => <dl className={styles.details}>{Object.keys(rows).map((key) => <React.Fragment key={key}><dt>{key}</dt><dd>{rows[key]}</dd></React.Fragment>)}</dl>;

export default ServerRoomDigitalTwin;
