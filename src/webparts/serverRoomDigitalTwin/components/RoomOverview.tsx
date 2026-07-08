import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import RackTile from './RackTile';
import MiniMap from './MiniMap';
import StatusLegend from './StatusLegend';
import { IInfraDevice, IInfraRack, IRackPlacement } from '../models/ServerRoomModels';
import { getRackPlacements } from '../utils/rackUtils';

const RoomOverview: React.FC<{ racks: IInfraRack[]; devices: IInfraDevice[]; placements: IRackPlacement[]; selectedRackId: string | null; onRackSelected: (rackId: string) => void }> = ({ racks, devices, placements, selectedRackId, onRackSelected }) => (
  <div className={styles.modePanel}>
    <div className={styles.roomHero}><div><span className={styles.breadcrumb}>Room Overview Mode</span><h2>Raum A · 2.5D Infrastrukturübersicht</h2><p>Mock documentation view for racks, device placement, capacity and future SharePoint list integration.</p></div><div className={styles.roomStats}><strong>{racks.length}</strong><span>Racks</span><strong>{devices.length}</strong><span>Devices</span></div></div>
    <section className={styles.roomScene} aria-label="2.5D room simulation">
      <div className={styles.floorGrid} />
      {racks.map((rack) => <RackTile key={rack.id} rack={rack} placements={getRackPlacements(rack.id, placements)} selected={selectedRackId === rack.id} onRackSelected={onRackSelected} />)}
    </section>
    <div className={styles.roomBottom}><div><h3>Status legend</h3><StatusLegend /></div><div><h3>MiniMap / Raumplan</h3><MiniMap racks={racks} selectedRackId={selectedRackId} /></div></div>
  </div>
);

export default RoomOverview;
