import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';

const DashboardHeader: React.FC<{ settingsOpen: boolean; onSettingsToggle: () => void }> = ({ settingsOpen, onSettingsToggle }) => (
  <header className={styles.dashboardHeader}>
    <div><span className={styles.breadcrumb}>Übersicht / Standort / Raum</span><h1>GLB Block Visualizer Preview v1</h1><small className={styles.versionMarker}>SharePoint-ready infrastructure documentation demo</small></div>
    <div className={styles.headerActions}><input aria-label="Search" placeholder="Search racks, devices, owners..." /><button onClick={onSettingsToggle}>{settingsOpen ? 'Admin schließen' : 'Admin'}</button><div className={styles.avatar}><span>AD</span><small>Admin Demo</small></div></div>
  </header>
);

export default DashboardHeader;
