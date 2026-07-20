import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import { IInfraDevice, IRackPlacement, RackMountSide } from '../models/ServerRoomModels';

const DeviceBlock: React.FC<{ device: IInfraDevice; placement: IRackPlacement; rackHeightU: number; side: RackMountSide; selected?: boolean; conflict?: boolean; onDeviceSelected: (deviceId: string) => void }> = ({ device, placement, rackHeightU, side, selected, conflict, onDeviceSelected }) => {
  const heightU = placement.heightU || 1;
  const top = ((rackHeightU - placement.startU - heightU + 1) / rackHeightU) * 100;
  const label = side === 'rear' ? (placement.rearLabel || device.hostname) : (placement.frontLabel || device.hostname);
  return <button className={`${styles.deviceBlockPremium} ${styles[`type${device.type}`]} ${selected ? styles.selectedDevice : ''} ${conflict ? styles.conflictDevice : ''}`} style={{ top: `${top}%`, height: `${(heightU / rackHeightU) * 100}%` }} onClick={(event) => { event.stopPropagation(); onDeviceSelected(device.id); }}><span className={styles.deviceMeta}>{device.type}</span><strong>{label}</strong><em>{device.vendor} · {device.model}</em><span className={styles.deviceBadges}><i>U{placement.startU} / {heightU}U</i><i>{placement.mountSide}</i></span><span className={styles.deviceTooltip}>IP {device.ipAddress} · VLAN {device.vlan || 'N/A'} · SN {device.serialNumber} · Warranty {device.warrantyExpiry}</span></button>;
};

export default DeviceBlock;
