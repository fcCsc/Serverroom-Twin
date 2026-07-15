import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './preview.css';

const racks = [
  {
    name: 'Rack A01',
    status: 'Online',
    load: '76%',
    devices: [
      { label: 'Core Switch', type: 'network', size: 2 },
      { label: 'App Server', type: 'compute', size: 4 },
      { label: 'Storage', type: 'storage', size: 3 },
      { label: 'Backup', type: 'backup', size: 2 },
      { label: 'UPS', type: 'power', size: 2 }
    ]
  },
  {
    name: 'Rack A02',
    status: 'Online',
    load: '68%',
    devices: [
      { label: 'Firewall', type: 'security', size: 2 },
      { label: 'Virtual Host', type: 'compute', size: 5 },
      { label: 'Storage Array', type: 'storage', size: 4 },
      { label: 'UPS', type: 'power', size: 2 }
    ]
  },
  {
    name: 'Rack A03',
    status: 'Warning',
    load: '54%',
    devices: [
      { label: 'Patch Panel', type: 'network', size: 2 },
      { label: 'Database', type: 'compute', size: 4 },
      { label: 'Archive', type: 'backup', size: 3 },
      { label: 'UPS', type: 'power', size: 2 }
    ]
  }
];

const inventory = [
  ['SW-DEMO-LEFT', 'Switch / network', 'Rack A01', 'Demo Networks', '192.0.2.11', 'Online'],
  ['SRV-APP-01', 'Server / compute', 'Rack A01', 'Contoso Systems', '192.0.2.21', 'Online'],
  ['FW-EDGE-01', 'Firewall / security', 'Rack A02', 'Fabrikam Secure', '192.0.2.31', 'Online'],
  ['NAS-BACKUP-01', 'Backup / archive', 'Rack A03', 'Northwind Storage', '192.0.2.41', 'Warning']
];

const metricCards = [
  ['Total Devices', '128', 'Alle Geräte'],
  ['Online', '112', '87.5%'],
  ['Warning', '11', '8.6%'],
  ['Critical', '5', '3.9%'],
  ['Temperatur (Ø)', '23.4 °C', 'Normal'],
  ['Gesamtleistung', '18.7 kW', '34% von 55 kW']
];

function RackCabinet({ rack }: { rack: typeof racks[number] }): JSX.Element {
  return (
    <article className="rackCard" aria-label={rack.name}>
      <div className="rackBadge"><span /> {rack.name}</div>
      <div className="rackShell">
        <div className="rackInner">
          {rack.devices.map((device) => (
            <div
              className={`deviceBlock ${device.type}`}
              style={{ flexGrow: device.size }}
              key={`${rack.name}-${device.label}`}
              title={device.label}
            >
              <span>{device.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rackFooter">
        <strong>{rack.status}</strong>
        <span>Belegung {rack.load}</span>
      </div>
    </article>
  );
}

function PreviewApp(): JSX.Element {
  return (
    <main className="previewShell">
      <aside className="sidebar">
        <div className="brandMark">▣</div>
        <strong>Serverroom Twin</strong>
        <nav>
          <a className="active">Standort</a>
          <a>Räume</a>
          <a>Racks</a>
          <a>Geräte</a>
          <a>Alarme</a>
        </nav>
      </aside>

      <section className="dashboard">
        <header className="topbar">
          <div>
            <p>Demo Campus / Floor 1 / Room A</p>
            <h1>Rack Room Digital Twin</h1>
            <span>Stabile GitHub-Pages Vorschau mit Server-Informationen und Rack-Übersicht.</span>
          </div>
          <div className="actions">
            <button>Front</button>
            <button>Rear</button>
            <button>Inventory</button>
          </div>
        </header>

        <section className="metrics" aria-label="Kennzahlen">
          {metricCards.map(([label, value, sub]) => (
            <article className="metric" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{sub}</small>
            </article>
          ))}
        </section>

        <section className="roomGrid">
          <div className="scenePanel">
            <div className="sceneHeader">
              <div>
                <h2>Raum A</h2>
                <p>3D-inspirierte Rack-Ansicht im Spline-Stil · GLB-freundliche Zieloptik</p>
              </div>
              <span>3 racks · Front</span>
            </div>
            <div className="meshFloor">
              <div className="rackStage">
                {racks.map((rack) => <RackCabinet rack={rack} key={rack.name} />)}
              </div>
            </div>
            <div className="legend">
              <span><i className="network" /> Switch / network</span>
              <span><i className="compute" /> Server / compute</span>
              <span><i className="storage" /> Storage</span>
              <span><i className="security" /> Firewall / security</span>
              <span><i className="power" /> UPS / power</span>
            </div>
          </div>

          <aside className="detailsPanel">
            <h2>Rack Details</h2>
            <dl>
              <dt>Rack</dt><dd>Rack A01</dd>
              <dt>Location</dt><dd>Demo Campus</dd>
              <dt>Floor</dt><dd>Floor 1</dd>
              <dt>Height</dt><dd>42U</dd>
              <dt>Status</dt><dd className="ok">Online</dd>
              <dt>Temperatur</dt><dd>22.1 °C</dd>
              <dt>Leistung</dt><dd>6.3 kW</dd>
            </dl>
            <button className="primaryAction">Aktionen</button>
          </aside>
        </section>

        <section className="inventoryPanel">
          <div className="panelTitle">
            <h2>Inventory</h2>
            <span>{inventory.length} demo devices shown</span>
          </div>
          <table>
            <thead>
              <tr><th>Device</th><th>Type</th><th>Rack</th><th>Manufacturer</th><th>IP</th><th>Status</th></tr>
            </thead>
            <tbody>
              {inventory.map((row) => (
                <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
    </main>
  );
}

ReactDOM.render(<PreviewApp />, document.getElementById('root'));
