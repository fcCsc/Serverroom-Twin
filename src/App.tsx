import { useMemo, useState } from 'react';
import { DataModeBanner } from './components/DataModeBanner';
import { RackList } from './components/RackList';
import { dummyDevices, dummyRacks } from './data/dummyData';
import type { DataSourceState, Device, Rack } from './types';
import './styles.css';

type ServerroomTwinProps = {
  racks?: Rack[];
  devices?: Device[];
  isLoading?: boolean;
  dataSource?: DataSourceState;
};

const defaultDataSource: DataSourceState = {
  isSharePointAvailable: false,
  isDummyData: true,
};

export default function App({
  racks = dummyRacks,
  devices = dummyDevices,
  isLoading = false,
  dataSource = defaultDataSource,
}: ServerroomTwinProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredRacks = useMemo(() => {
    if (!normalizedQuery) {
      return racks;
    }

    const matchingRackIds = new Set(
      devices
        .filter((device) => `${device.name} ${device.type}`.toLowerCase().includes(normalizedQuery))
        .map((device) => device.rackId),
    );

    return racks.filter(
      (rack) =>
        `${rack.name} ${rack.location}`.toLowerCase().includes(normalizedQuery) || matchingRackIds.has(rack.id),
    );
  }, [devices, normalizedQuery, racks]);

  return (
    <main className="app-shell">
      <DataModeBanner dataSource={dataSource} />
      <header className="hero">
        <div>
          <p className="eyebrow">Serverroom Twin</p>
          <h1>Rack and device overview</h1>
        </div>
        <label className="search-box">
          <span>Search racks or devices</span>
          <input
            type="search"
            placeholder="Search by rack, location, device, or type"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
      </header>
      <RackList
        racks={filteredRacks}
        devices={devices}
        isLoading={isLoading}
        hasSearchQuery={normalizedQuery.length > 0}
      />
    </main>
  );
}
