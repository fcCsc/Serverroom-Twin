const assert = require('node:assert/strict');
const test = require('node:test');
const { renderHeader, renderSidebar, renderRackView, renderDetailPanel, renderDeviceTable, renderApp } = require('../src/components');

const racks = [{ id: 'a1', name: 'A1', status: 'warning', devices: [{ name: 'Core switch', unit: 42, status: 'online' }] }];
const device = { name: 'Core switch', rack: 'A1', unit: 42, status: 'online' };

test('interactive rack and device elements use button semantics and aria labels', () => {
  const html = renderRackView(racks);
  assert.match(html, /<button class="rack-card__summary" type="button" aria-label="Select rack A1/);
  assert.match(html, /<button class="device device--online" type="button" aria-label="Device Core switch/);
});

test('status badges include visible text and accessible labels', () => {
  const html = renderDeviceTable([device]);
  assert.match(html, /Status: Online, operating normally/);
  assert.match(html, /<span class="status__text">Online<\/span>/);
});

test('header, sidebar, detail panel, and table expose labels and controls', () => {
  const html = [renderHeader(), renderSidebar([{ label: 'Room 1', count: 4 }]), renderDetailPanel(device), renderDeviceTable([device])].join('');
  assert.match(html, /Skip to rack view/);
  assert.match(html, /aria-label="Server room navigation"/);
  assert.match(html, /aria-label="Open maintenance workflow for Core switch"/);
  assert.match(html, /<th scope="col">Status<\/th>/);
});

test('application markup preserves logical tab order by source order', () => {
  const html = renderApp({ filters: [{ label: 'Room 1', count: 4 }], racks, selectedDevice: device, devices: [device] });
  const landmarks = ['class="app-header"', 'class="sidebar"', 'id="rack-view"', 'class="detail-panel"', 'class="table-section"'];
  const positions = landmarks.map((landmark) => html.indexOf(landmark));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.ok(positions.every((position) => position >= 0));
});
