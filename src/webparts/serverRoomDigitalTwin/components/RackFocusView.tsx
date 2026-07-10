import * as React from 'react';
import styles from './ServerRoomDigitalTwin.module.scss';
import GlbDummyVisualizer from './GlbDummyVisualizer';
import { IInfraDevice, IInfraRack, IRackPlacement, RackMountSide } from '../models/ServerRoomModels';
import { getRackPlacements, getUsedUnits } from '../utils/rackUtils';

const tabs = ['Front', 'Back', 'Details', 'Geräte', 'Verkabelung'];

const RackFocusView: React.FC<{ rack: IInfraRack; devices: IInfraDevice[]; placements: IRackPlacement[]; selectedDeviceId: string | null; rackSide: RackMountSide; activeTab: string; onRackSideChange: (side: RackMountSide) => void; onTabChange: (tab: string) => void; onBack: () => void; onDeviceSelected: (deviceId: string) => void }> = ({ rack, devices, placements, selectedDeviceId, rackSide, activeTab, onRackSideChange, onTabChange, onBack, onDeviceSelected }) => {
  const rackPlacements = getRackPlacements(rack.id, placements);
  const side = activeTab === 'Back' ? 'rear' : 'front';
  React.useEffect(() => { if (activeTab === 'Front') onRackSideChange('front'); if (activeTab === 'Back') onRackSideChange('rear'); }, [activeTab]);
  return <div className={styles.modePanel}><button className={styles.backButton} onClick={onBack}>← Zurück zu Raum A</button><div className={styles.focusHeader}><div><span className={styles.breadcrumb}>Rack Focus Mode</span><h2>{rack.name} · {rack.heightU}U · {rack.room}</h2><p>{getUsedUnits(rackPlacements)}U used · {Math.max(rack.heightU - getUsedUnits(rackPlacements), 0)}U free</p></div></div><div className={styles.focusTabs}>{tabs.map((tab) => <button key={tab} className={activeTab === tab ? styles.tabActive : ''} onClick={() => onTabChange(tab)}>{tab}</button>)}</div>{activeTab === 'Front' || activeTab === 'Back' ? <GlbDummyVisualizer racks={[rack]} devices={devices} placements={rackPlacements} selectedRackId={rack.id} selectedDeviceId={selectedDeviceId} mode="focus" rackSide={side} onDeviceSelected={onDeviceSelected} /> : <div className={styles.placeholderPanel}><h3>{activeTab}</h3><p>Documentation placeholder for future SharePoint-backed {activeTab.toLowerCase()} data. Preview remains dummy-data-only.</p></div>}</div>;
};

export default RackFocusView;
