import type { DataSourceState } from '../types';

type DataModeBannerProps = {
  dataSource: DataSourceState;
};

export function DataModeBanner({ dataSource }: DataModeBannerProps) {
  if (dataSource.isSharePointAvailable && !dataSource.isDummyData) {
    return null;
  }

  return (
    <div className="data-mode-banner" role="note">
      {dataSource.isDummyData && <span className="demo-badge">Demo data mode</span>}
      {!dataSource.isSharePointAvailable && (
        <span>SharePoint List integration unavailable. Showing the best available local data.</span>
      )}
      {dataSource.isSharePointAvailable && dataSource.isDummyData && (
        <span>Dummy fallback active while live rack/device records are unavailable.</span>
      )}
    </div>
  );
}
