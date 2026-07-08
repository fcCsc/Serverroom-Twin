import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';

const statuses = ['online', 'warning', 'critical', 'offline', 'maintenance'];

const StatusLegend: React.FC = () => <div className={styles.statusLegend}>{statuses.map((status) => <span key={status}><i className={styles[`status${status}`]} />{status}</span>)}</div>;

export default StatusLegend;
