import type { Device, Rack } from '../types';
import { StatusNotice } from './StatusNotice';

type RackListProps = {
  racks: Rack[];
  devices: Device[];
  isLoading: boolean;
  hasSearchQuery: boolean;
};

export function RackList({ racks, devices, isLoading, hasSearchQuery }: RackListProps) {
  if (isLoading) {
    return <StatusNotice title="Loading rack data" message="Fetching rack and device records..." />;
  }

  if (hasSearchQuery && racks.length === 0) {
    return <StatusNotice title="No search results" message="Try a different rack, device, or location search term." tone="empty" />;
  }

  if (racks.length === 0) {
    return <StatusNotice title="No racks found" message="No rack records are available from the current data source." tone="empty" />;
  }

  return (
    <div className="rack-grid" aria-label="Server racks">
      {racks.map((rack) => {
        const rackDevices = devices.filter((device) => device.rackId === rack.id);

        return (
          <article className="rack-card" key={rack.id}>
            <header>
              <h2>{rack.name}</h2>
              <span>{rack.location}</span>
            </header>
            <p>{rack.capacityU}U capacity</p>
            {rackDevices.length === 0 ? (
              <StatusNotice title="No devices found" message="This rack does not currently have device records." tone="empty" />
            ) : (
              <ul className="device-list">
                {rackDevices.map((device) => (
                  <li key={device.id} className={`device device--${device.status}`}>
                    <strong>{device.name}</strong>
                    <span>{device.type}</span>
                    <small>U{device.uPosition}</small>
                  </li>
                ))}
              </ul>
            )}
          </article>
        );
      })}
    </div>
  );
}
