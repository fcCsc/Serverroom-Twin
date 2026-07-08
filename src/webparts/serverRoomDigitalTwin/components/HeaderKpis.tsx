import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import { IInfraDevice, IInfraRack, IRackPlacement } from '../models/ServerRoomModels';

const HeaderKpis: React.FC<{ racks: IInfraRack[]; devices: IInfraDevice[]; placements: IRackPlacement[] }> = ({ devices, placements }) => {
  const online = devices.filter((device) => device.status === 'online').length;
  const warning = devices.filter((device) => device.status === 'warning').length;
  const critical = devices.filter((device) => device.status === 'critical').length;
  const cards = [
    ['Total Devices', `${devices.length}`, 'Dokumentierte Assets'],
    ['Online', `${online}`, 'Mock status'],
    ['Warning', `${warning}`, 'Mock status'],
    ['Critical', `${critical}`, 'Mock status'],
    ['Temperatur', '22.4°C', 'Dokumentationswert'],
    ['Gesamtleistung', `${(placements.length * 0.42).toFixed(1)} kW`, 'Planungswert']
  ];
  return <section className={styles.kpiGrid}>{cards.map(([label, value, sub]) => <article key={label} className={styles.kpiCard}><span>{label}</span><strong>{value}</strong><small>{sub}</small></article>)}</section>;
};

export default HeaderKpis;
