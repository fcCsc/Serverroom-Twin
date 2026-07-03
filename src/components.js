const statusCopy = {
  online: { label: 'Online', description: 'operating normally' },
  warning: { label: 'Warning', description: 'requires attention' },
  critical: { label: 'Critical', description: 'service impacted' },
  offline: { label: 'Offline', description: 'not reachable' }
};

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[char]);
}

function statusBadge(status) {
  const normalized = statusCopy[status] ? status : 'offline';
  const copy = statusCopy[normalized];
  return `<span class="status status--${normalized}" aria-label="Status: ${copy.label}, ${copy.description}">
    <span class="status__dot" aria-hidden="true"></span>
    <span class="status__text">${copy.label}</span>
  </span>`;
}

function renderHeader() {
  return `<header class="app-header">
    <a class="skip-link" href="#rack-view">Skip to rack view</a>
    <div>
      <p class="eyebrow">Server room twin</p>
      <h1>Infrastructure overview</h1>
    </div>
    <button class="header-action" type="button" aria-label="Refresh rack, device, and alert data">Refresh data</button>
  </header>`;
}

function renderSidebar(filters) {
  return `<aside class="sidebar" aria-label="Server room navigation">
    <h2>Rooms</h2>
    <nav aria-label="Room filters">
      ${filters.map((filter, index) => `<button class="sidebar__item${index === 0 ? ' sidebar__item--active' : ''}" type="button" aria-label="Show ${escapeHtml(filter.label)} racks, ${filter.count} total">
        <span>${escapeHtml(filter.label)}</span>
        <span class="sidebar__count">${filter.count}</span>
      </button>`).join('')}
    </nav>
  </aside>`;
}

function renderDevice(device) {
  return `<button class="device device--${escapeHtml(device.status)}" type="button" aria-label="Device ${escapeHtml(device.name)} in rack unit ${escapeHtml(device.unit)}. Status ${statusCopy[device.status]?.label || 'Offline'}.">
    <span class="device__name">${escapeHtml(device.name)}</span>
    <span class="device__unit">U${escapeHtml(device.unit)}</span>
    ${statusBadge(device.status)}
  </button>`;
}

function renderRack(rack) {
  return `<section class="rack-card" aria-labelledby="rack-${escapeHtml(rack.id)}-title">
    <button class="rack-card__summary" type="button" aria-label="Select rack ${escapeHtml(rack.name)}. ${rack.devices.length} devices. ${statusCopy[rack.status]?.label || 'Offline'} status.">
      <span>
        <span class="rack-card__label">Rack</span>
        <strong id="rack-${escapeHtml(rack.id)}-title">${escapeHtml(rack.name)}</strong>
      </span>
      ${statusBadge(rack.status)}
    </button>
    <div class="rack-card__devices" role="list" aria-label="Devices in ${escapeHtml(rack.name)}">
      ${rack.devices.map((device) => `<div role="listitem">${renderDevice(device)}</div>`).join('')}
    </div>
  </section>`;
}

function renderRackView(racks) {
  return `<main id="rack-view" class="rack-view" tabindex="-1">
    <h2>Rack view</h2>
    <div class="rack-grid">
      ${racks.map(renderRack).join('')}
    </div>
  </main>`;
}

function renderDetailPanel(device) {
  return `<aside class="detail-panel" aria-labelledby="detail-title">
    <h2 id="detail-title">Device details</h2>
    <dl>
      <div><dt>Name</dt><dd>${escapeHtml(device.name)}</dd></div>
      <div><dt>Rack unit</dt><dd>U${escapeHtml(device.unit)}</dd></div>
      <div><dt>Status</dt><dd>${statusBadge(device.status)}</dd></div>
    </dl>
    <button type="button" aria-label="Open maintenance workflow for ${escapeHtml(device.name)}">Create maintenance task</button>
  </aside>`;
}

function renderDeviceTable(devices) {
  return `<section class="table-section" aria-labelledby="device-table-title">
    <h2 id="device-table-title">Device inventory</h2>
    <table>
      <thead><tr><th scope="col">Device</th><th scope="col">Rack</th><th scope="col">Unit</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead>
      <tbody>
        ${devices.map((device) => `<tr><td>${escapeHtml(device.name)}</td><td>${escapeHtml(device.rack)}</td><td>U${escapeHtml(device.unit)}</td><td>${statusBadge(device.status)}</td><td><button type="button" aria-label="View details for ${escapeHtml(device.name)}">View</button></td></tr>`).join('')}
      </tbody>
    </table>
  </section>`;
}

function renderApp({ filters, racks, selectedDevice, devices }) {
  return `${renderHeader()}
  <div class="layout">
    ${renderSidebar(filters)}
    ${renderRackView(racks)}
    ${renderDetailPanel(selectedDevice)}
    ${renderDeviceTable(devices)}
  </div>`;
}

module.exports = { renderHeader, renderSidebar, renderRackView, renderDetailPanel, renderDeviceTable, renderApp, statusBadge };
