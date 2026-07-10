import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import MiniMap from './MiniMap';
import StatusLegend from './StatusLegend';
import GlbDummyVisualizer from './GlbDummyVisualizer';
import { IInfraDevice, IInfraRack, IRackPlacement } from '../models/ServerRoomModels';

const RoomOverview: React.FC<{ racks: IInfraRack[]; devices: IInfraDevice[]; placements: IRackPlacement[]; selectedRackId: string | null; onRackSelected: (rackId: string) => void }> = ({ racks, devices, placements, selectedRackId, onRackSelected }) => (
  <div className={styles.modePanel}>
    <div className={styles.roomHero}><div><span className={styles.breadcrumb}>Room Overview Mode</span><h2>Raum A · 2.5D Infrastrukturübersicht</h2><p>Mock documentation view for racks, device placement, capacity and future SharePoint list integration.</p></div><div className={styles.roomStats}><strong>{racks.length}</strong><span>Racks</span><strong>{devices.length}</strong><span>Devices</span></div></div>
    <GlbDummyVisualizer racks={racks} devices={devices} placements={placements} selectedRackId={selectedRackId} mode="room" onRackSelected={onRackSelected} />
    <div className={styles.roomBottom}><div><h3>Device type / rack category legend</h3><StatusLegend /></div><div><h3>MiniMap / Raumplan</h3><MiniMap racks={racks} selectedRackId={selectedRackId} /></div></div>
  </div>
);

export default RoomOverview;
