import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import RackUnitRow from './RackUnitRow';
import DeviceBlock from './DeviceBlock';
import { IInfraDevice, IInfraRack, IRackPlacement, RackMountSide } from '../models/ServerRoomModels';
import { getPlacementConflicts, getPlacementDevice, placementVisibleOnSide, rackUnits } from '../utils/rackUtils';

const RackElevation: React.FC<{ rack: IInfraRack; devices: IInfraDevice[]; placements: IRackPlacement[]; side: RackMountSide; selectedDeviceId: string | null; onDeviceSelected: (deviceId: string) => void }> = ({ rack, devices, placements, side, selectedDeviceId, onDeviceSelected }) => {
  const visiblePlacements = placements.filter((placement) => placementVisibleOnSide(placement, side));
  const conflicts = getPlacementConflicts(placements, side);
  return <div className={styles.rackElevationLarge} style={{ ['--rack-units' as string]: rack.heightU }}><div className={styles.uScale}>{rackUnits(rack.heightU).map((unit) => <span key={unit} className={unit % 5 === 0 ? styles.majorUnit : ''}>U{String(unit).padStart(2, '0')}</span>)}</div><div className={styles.rackCabinet}>{rackUnits(rack.heightU).map((unit) => <RackUnitRow key={unit} unit={unit} />)}{visiblePlacements.map((placement) => { const device = getPlacementDevice(placement, devices); return device ? <DeviceBlock key={placement.id} device={device} placement={placement} rackHeightU={rack.heightU} selected={selectedDeviceId === device.id} conflict={conflicts[placement.id]} side={side} onDeviceSelected={onDeviceSelected} /> : null; })}<div className={styles.rearPdu}>{side === 'rear' && <span>Vertical PDU</span>}</div></div></div>;
};

export default RackElevation;
