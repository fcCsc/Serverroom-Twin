import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';

const categories = ['Network', 'Compute', 'Security', 'Storage', 'Power', 'Patch'];

const StatusLegend: React.FC = () => <div className={styles.statusLegend}>{categories.map((category) => <span key={category}><i className={styles[`category${category}`]} />{category}</span>)}</div>;

export default StatusLegend;
