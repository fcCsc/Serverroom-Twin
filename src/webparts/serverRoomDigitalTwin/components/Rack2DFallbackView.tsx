import * as React from 'react';
import { IDevice, IRack, MountWidth } from '../models/ServerRoomModels';
import styles from './ServerRoomDigitalTwin.module.scss';

interface IRack2DFallbackViewProps {
  racks: IRack[];
  devices: IDevice[];
  selectedRackKey?: string;
  selectedDeviceKey?: string;
  onRackSelected: (rackKey: string) => void;
  onDeviceSelected: (device: IDevice) => void;
}

const widthPercent: { [key in MountWidth]: number } = {
  Full: 100,
  Half: 50,
  Third: 33.333,
  Quarter: 25
};

const leftPercent = (device: IDevice): number => {
  const width = widthPercent[device.MountWidth];
  return Math.max(0, Math.min(100 - width, (device.HorizontalSlot - 1) * width));
};

const Rack2DFallbackView: React.FC<IRack2DFallbackViewProps> = ({ racks, devices, selectedRackKey, selectedDeviceKey, onRackSelected, onDeviceSelected }) => (
  <div className={styles.fallbackGrid} aria-label="2D rack fallback view">
    {racks.map((rack) => {
      const rackDevices = devices.filter((device) => device.RackKey === rack.RackKey);
      return (
        <button key={rack.RackKey} className={`${styles.fallbackRack} ${selectedRackKey === rack.RackKey ? styles.selectedRack : ''}`} onClick={() => onRackSelected(rack.RackKey)}>
          <div className={styles.rackTop}><strong>{rack.Title}</strong><span>{rack.RackHeightU}U</span></div>
          <div className={styles.fallbackUnits}>
            {rackDevices.map((device) => {
              const bottom = ((device.UPosition - 1) / rack.RackHeightU) * 100;
              const height = (device.UHeight / rack.RackHeightU) * 100;
              return (
                <span
                  key={device.DeviceKey}
                  role="button"
                  tabIndex={0}
                  className={`${styles.fallbackDevice} ${selectedDeviceKey === device.DeviceKey ? styles.selectedDevice : ''}`}
                  style={{ bottom: `${bottom}%`, height: `${Math.max(height, 2.4)}%`, left: `${leftPercent(device)}%`, width: `${widthPercent[device.MountWidth]}%` }}
                  onClick={(event) => { event.stopPropagation(); onDeviceSelected(device); }}
                  onKeyDown={(event) => { if (event.key === 'Enter') onDeviceSelected(device); }}
                >
                  {device.Title}<small>{device.RackSide} • U{device.UPosition} • {device.MountWidth}</small>
                </span>
              );
            })}
          </div>
        </button>
      );
    })}
  </div>
);

export default Rack2DFallbackView;
