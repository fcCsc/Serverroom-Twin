import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import { IInfraRack, IRackPlacement } from '../models/ServerRoomModels';
import { getOccupancy, getUsedUnits, statusLabel } from '../utils/rackUtils';

const RackTile: React.FC<{ rack: IInfraRack; placements: IRackPlacement[]; selected?: boolean; onRackSelected: (rackId: string) => void }> = ({ rack, placements, selected, onRackSelected }) => {
  const occupancy = getOccupancy(rack, placements);
  const usedU = getUsedUnits(placements);
  return <button className={`${styles.rackTile} ${styles[`status${rack.status}`]} ${selected ? styles.rackTileSelected : ''}`} style={{ left: `${rack.positionX}%`, top: `${rack.positionY}%` }} onClick={() => onRackSelected(rack.id)}><strong>{rack.name}</strong><span>{rack.heightU}U · {occupancy}%</span><em>{statusLabel(rack.status)}</em><div className={styles.rackTooltip}><b>{rack.name}</b><span>{rack.room}</span><span>{statusLabel(rack.status)}</span><span>{usedU}U / {rack.heightU}U</span><span>{placements.length} devices</span></div></button>;
};

export default RackTile;
