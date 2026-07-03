import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import { mockDevices, mockRacks } from '../data/mockData';
import { IDevice, IRack, HealthStatus } from '../models/ServerRoomModels';
import { IServerRoomDigitalTwinProps } from './IServerRoomDigitalTwinProps';

const statusOptions: Array<HealthStatus | 'All'> = ['All', 'Healthy', 'Warning', 'Critical', 'Offline'];

const ServerRoomDigitalTwin: React.FC<IServerRoomDigitalTwinProps> = ({ racksListName, devicesListName, useDummyData }) => {
  const [selectedRackId, setSelectedRackId] = React.useState<string>(mockRacks[0].id);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | undefined>();
  const [search, setSearch] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<HealthStatus | 'All'>('All');
  const [settingsOpen, setSettingsOpen] = React.useState<boolean>(false);

  const selectedRack: IRack | undefined = mockRacks.filter((rack) => rack.id === selectedRackId)[0];
  const selectedDevice: IDevice | undefined = selectedDeviceId ? mockDevices.filter((device) => device.id === selectedDeviceId)[0] : undefined;

  const filteredDevices: IDevice[] = mockDevices.filter((device) => {
    const rack = mockRacks.filter((candidate) => candidate.id === device.rackId)[0];
    const searchText = `${device.name} ${device.type} ${device.status} ${device.environment} ${rack ? rack.name : ''}`.toLowerCase();
    const matchesSearch = searchText.indexOf(search.toLowerCase()) > -1;
    const matchesStatus = statusFilter === 'All' || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const rackDevices = filteredDevices.filter((device) => device.rackId === selectedRackId);

  const onRackClick = (rackId: string): void => {
    setSelectedRackId(rackId);
    setSelectedDeviceId(undefined);
  };

  const onDeviceClick = (device: IDevice): void => {
    setSelectedRackId(device.rackId);
    setSelectedDeviceId(device.id);
  };

  return (
    <section className={styles.digitalTwin}>
      <header className={styles.header}>
        <div>
          <span className={styles.kicker}>SharePoint prototype</span>
          <h1>Server Room Digital Twin</h1>
          <p>App-like rack and device visualization backed by dummy data today and SharePoint Lists later.</p>
        </div>
        <div className={styles.headerControls}>
          <input aria-label="Search racks and devices" placeholder="Search racks, devices, status..." value={search} onChange={(event) => setSearch(event.currentTarget.value)} />
          <select aria-label="Status filter" value={statusFilter} onChange={(event) => setStatusFilter(event.currentTarget.value as HealthStatus | 'All')}>
            {statusOptions.map((status) => <option key={status}>{status}</option>)}
          </select>
          <button onClick={() => setSettingsOpen(!settingsOpen)}>{settingsOpen ? 'Close settings' : 'Admin settings'}</button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <h2>Locations & racks</h2>
          {Array.from(new Set(mockRacks.map((rack) => rack.location))).map((location) => (
            <div key={location} className={styles.locationGroup}>
              <h3>{location}</h3>
              {mockRacks.filter((rack) => rack.location === location).map((rack) => (
                <button key={rack.id} className={`${styles.rackNav} ${selectedRackId === rack.id ? styles.active : ''}`} onClick={() => onRackClick(rack.id)}>
                  <span>{rack.name}</span><span className={styles[`status${rack.status}`]}>{rack.status}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className={styles.rackView}>
          <div className={styles.sectionTitle}><h2>Visual rack view</h2><span>{useDummyData ? 'Demo data mode' : 'SharePoint mode'}</span></div>
          <div className={styles.rackGrid}>
            {mockRacks.map((rack) => (
              <button key={rack.id} className={`${styles.rackCard} ${selectedRackId === rack.id ? styles.selectedRack : ''}`} onClick={() => onRackClick(rack.id)}>
                <div className={styles.rackTop}><strong>{rack.name}</strong><span className={styles[`status${rack.status}`]}>{rack.status}</span></div>
                <div className={styles.units}>
                  {mockDevices.filter((device) => device.rackId === rack.id).map((device) => (
                    <span key={device.id} role="button" tabIndex={0} className={`${styles.deviceBlock} ${styles[`status${device.status}`]}`} style={{ minHeight: `${Math.max(device.unitHeight * 16, 22)}px` }} onClick={(event) => { event.stopPropagation(); onDeviceClick(device); }} onKeyDown={(event) => { if (event.key === 'Enter') onDeviceClick(device); }}>
                      {device.name}<small>{device.unitStart}U • {device.type}</small>
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </main>

        <aside className={styles.detailPanel}>
          <h2>{selectedDevice ? 'Device details' : 'Rack details'}</h2>
          {selectedDevice ? <Details rows={{ Device: selectedDevice.name, Type: selectedDevice.type, Status: selectedDevice.status, Rack: selectedRack ? selectedRack.name : selectedDevice.rackId, Units: `${selectedDevice.unitStart}U / ${selectedDevice.unitHeight}U`, Environment: selectedDevice.environment, Owner: selectedDevice.owner, Notes: selectedDevice.notes }} /> : selectedRack && <Details rows={{ Rack: selectedRack.name, Location: selectedRack.location, Row: selectedRack.row, Number: selectedRack.rackNumber, Units: `${selectedRack.totalUnits}U`, Status: selectedRack.status, Devices: `${mockDevices.filter((device) => device.rackId === selectedRack.id).length}` }} />}
          {settingsOpen && <div className={styles.settings}><h3>Future SharePoint mapping</h3><p>Rack list: {racksListName || 'Racks'}</p><p>Device list: {devicesListName || 'Devices'}</p><p>Column mapping controls will be added in a later integration phase.</p></div>}
        </aside>
      </div>

      <footer className={styles.tablePanel}>
        <h2>Device inventory</h2>
        <table><thead><tr><th>Device</th><th>Type</th><th>Rack</th><th>Unit</th><th>Status</th><th>Environment</th><th>Owner</th></tr></thead><tbody>
          {(selectedRack ? rackDevices : filteredDevices).map((device) => {
            const rack = mockRacks.filter((candidate) => candidate.id === device.rackId)[0];
            return <tr key={device.id} className={selectedDeviceId === device.id ? styles.selectedRow : ''} onClick={() => onDeviceClick(device)}><td>{device.name}</td><td>{device.type}</td><td>{rack ? rack.name : device.rackId}</td><td>{device.unitStart}U</td><td><span className={styles[`status${device.status}`]}>{device.status}</span></td><td>{device.environment}</td><td>{device.owner}</td></tr>;
          })}
        </tbody></table>
      </footer>
    </section>
  );
};

const Details: React.FC<{ rows: { [key: string]: string } }> = ({ rows }) => <dl className={styles.details}>{Object.keys(rows).map((key) => <React.Fragment key={key}><dt>{key}</dt><dd>{rows[key]}</dd></React.Fragment>)}</dl>;

export default ServerRoomDigitalTwin;
