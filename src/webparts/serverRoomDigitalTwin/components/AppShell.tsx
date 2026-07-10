import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import SidebarNav from './SidebarNav';
import DashboardHeader from './DashboardHeader';
import { IInfraDevice, IInfraRack, IRackPlacement } from '../models/ServerRoomModels';

interface IAppShellProps {
  racks: IInfraRack[];
  devices: IInfraDevice[];
  placements: IRackPlacement[];
  settingsOpen: boolean;
  onSettingsToggle: () => void;
  details: React.ReactNode;
  children: React.ReactNode;
}

const AppShell: React.FC<IAppShellProps> = ({ racks, devices, placements, settingsOpen, onSettingsToggle, details, children }) => (
  <section className={styles.infraDashboard}>
    <SidebarNav />
    <div className={styles.appMain}>
      <DashboardHeader settingsOpen={settingsOpen} onSettingsToggle={onSettingsToggle} />
      <div className={styles.contentGrid}>
        <main className={styles.primaryCanvas}>{children}</main>
        {details}
      </div>
    </div>
  </section>
);

export default AppShell;
