import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import { IInfraRack, IRackPlacement } from '../models/ServerRoomModels';
import { getOccupancy, getUsedUnits } from '../utils/rackUtils';

const RackTile: React.FC<{ rack: IInfraRack; placements: IRackPlacement[]; selected?: boolean; onRackSelected: (rackId: string) => void }> = ({ rack, placements, selected, onRackSelected }) => {
  const occupancy = getOccupancy(rack, placements);
  const usedU = getUsedUnits(placements);
  return <button className={`${styles.rackTile} ${styles[`status${rack.status}`]} ${selected ? styles.rackTileSelected : ''}`} style={{ left: `${rack.positionX}%`, top: `${rack.positionY}%` }} onClick={() => onRackSelected(rack.id)}><strong>{rack.name}</strong><span>{rack.heightU}U · {occupancy}%</span><em>{rack.type}</em><div className={styles.rackTooltip}><b>{rack.name}</b><span>{rack.room}</span><span>{rack.site} / {rack.room}</span><span>{usedU}U used / {Math.max(rack.heightU - usedU, 0)}U free</span><span>{placements.length} devices</span><span>{rack.type}</span></div></button>;
};

export default RackTile;
