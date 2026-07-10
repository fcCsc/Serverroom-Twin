import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import { IInfraDevice, IRackPlacement } from '../models/ServerRoomModels';

const DeviceBlock: React.FC<{ device: IInfraDevice; placement: IRackPlacement; rackHeightU: number; selected?: boolean; conflict?: boolean; onDeviceSelected: (deviceId: string) => void }> = ({ device, placement, rackHeightU, selected, conflict, onDeviceSelected }) => {
  const heightU = placement.heightU || 1;
  const top = ((rackHeightU - placement.startU - heightU + 1) / rackHeightU) * 100;
  return <button className={`${styles.deviceBlockPremium} ${styles[`type${device.type}`]} ${selected ? styles.selectedDevice : ''} ${conflict ? styles.conflictDevice : ''}`} style={{ top: `${top}%`, height: `${Math.max(heightU * 32, 30)}px` }} onClick={(event) => { event.stopPropagation(); onDeviceSelected(device.id); }}><span className={styles.deviceMeta}>{device.type}</span><strong>{placement.frontLabel || device.hostname}</strong><em>{device.vendor} · {device.model}</em><span className={styles.deviceBadges}><i>U{placement.startU} / {heightU}U</i><i>{placement.mountSide}</i></span><span className={styles.deviceTooltip}>IP {device.ipAddress} · VLAN {device.vlan || 'N/A'} · SN {device.serialNumber} · Warranty {device.warrantyExpiry}</span></button>;
};

export default DeviceBlock;
