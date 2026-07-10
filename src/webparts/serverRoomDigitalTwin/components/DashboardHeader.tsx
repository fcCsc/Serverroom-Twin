import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';

const DashboardHeader: React.FC<{ settingsOpen: boolean; onSettingsToggle: () => void }> = ({ settingsOpen, onSettingsToggle }) => (
  <header className={styles.dashboardHeader}>
    <div><span className={styles.breadcrumb}>Übersicht / Rechenzentrum / Raum A</span><h1>IT Infrastructure Dashboard</h1></div>
    <div className={styles.headerActions}><input aria-label="Search" placeholder="Search racks, devices, owners..." /><button onClick={onSettingsToggle}>{settingsOpen ? 'Admin schließen' : 'Admin'}</button><div className={styles.avatar}><span>AD</span><small>Admin Demo</small></div></div>
  </header>
);

export default DashboardHeader;
