import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import { IInfraDevice, IInfraRack, IRackPlacement } from '../models/ServerRoomModels';

const HeaderKpis: React.FC<{ racks: IInfraRack[]; devices: IInfraDevice[]; placements: IRackPlacement[] }> = ({ racks, devices, placements }) => {
  const totalRackU = racks.reduce((sum, rack) => sum + rack.heightU, 0);
  const usedU = placements.reduce((sum, placement) => sum + (placement.heightU || 1), 0);
  const cards = [
    ['Total Racks', `${racks.length}`, 'Documented cabinets'],
    ['Total Devices', `${devices.length}`, 'Documented assets'],
    ['Used HE', `${usedU}U`, 'Planned placement'],
    ['Free HE', `${Math.max(totalRackU - usedU, 0)}U`, 'Available capacity'],
    ['Rooms / Locations', '1 / 1', 'Preview scope']
  ];
  return <section className={styles.kpiGrid}>{cards.map(([label, value, sub]) => <article key={label} className={styles.kpiCard}><span>{label}</span><strong>{value}</strong><small>{sub}</small></article>)}</section>;
};

export default HeaderKpis;
