import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';

const RackUnitRow: React.FC<{ unit: number }> = ({ unit }) => <span className={unit % 5 === 0 ? styles.majorBand : ''}><em>U{String(unit).padStart(2, '0')}</em></span>;

export default RackUnitRow;
