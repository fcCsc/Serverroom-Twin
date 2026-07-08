import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';

const navItems = ['Standort', 'Räume', 'Racks', 'Geräte', 'Netzwerk', 'Alarme', 'Tickets', 'Wartung', 'Berichte', 'Dokumente', 'Einstellungen'];

const SidebarNav: React.FC = () => (
  <aside className={styles.appSidebar}>
    <div className={styles.sidebarBrand}><span>IV</span><div><strong>InfraVision</strong><small>DC-1 Frankfurt</small></div></div>
    <nav>{navItems.map((item, index) => <button key={item} className={index === 1 ? styles.navActive : ''}><i />{item}</button>)}</nav>
  </aside>
);

export default SidebarNav;
