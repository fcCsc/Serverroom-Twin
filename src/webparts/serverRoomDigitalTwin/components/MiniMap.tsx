import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import { IInfraRack } from '../models/ServerRoomModels';

const MiniMap: React.FC<{ racks: IInfraRack[]; selectedRackId?: string | null }> = ({ racks, selectedRackId }) => <div className={styles.miniMap}>{racks.map((rack) => <span key={rack.id} className={selectedRackId === rack.id ? styles.miniMapSelected : ''} style={{ left: `${rack.positionX}%`, top: `${rack.positionY}%` }} />)}</div>;

export default MiniMap;
