import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ServerRoomDigitalTwin from '../../src/webparts/serverRoomDigitalTwin/components/ServerRoomDigitalTwin';
import './preview.css';

const escapeHtml = (value: string): string => value.replace(/[&<>\"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[character] || character));

const showFallback = (html: string): void => {
  const fallback = document.getElementById('preview-fallback');
  const appRoot = document.getElementById('app-root');
  if (!fallback) return;
  fallback.innerHTML = html;
  fallback.classList.remove('previewFallbackHidden');
  if (appRoot) appRoot.innerHTML = '';
};

const hideFallbackIfDashboardRendered = (): void => {
  const fallback = document.getElementById('preview-fallback');
  const appRoot = document.getElementById('app-root');
  const hasDashboardText = !!appRoot && (appRoot.textContent || '').trim().length > 20;
  if (fallback && hasDashboardText) fallback.classList.add('previewFallbackHidden');
};

const keepFallbackVisibleIfAppIsBlank = (): void => {
  const appRoot = document.getElementById('app-root');
  const fallback = document.getElementById('preview-fallback');
  if (!appRoot || !fallback) return;
  if ((appRoot.textContent || '').trim().length === 0 && appRoot.children.length === 0) {
    fallback.classList.remove('previewFallbackHidden');
  }
};

const renderFatalFallback = (error?: unknown): void => {
  const message = escapeHtml(error instanceof Error ? error.message : 'The 3D preview could not be started.');
  showFallback(`<strong>Serverroom Twin Preview</strong><h1>Dashboard konnte nicht gestartet werden</h1><p>${message}</p><p>Bitte lade die Seite neu oder öffne den Build ohne Browser-Erweiterungen. Die Seite zeigt diese Meldung statt schwarz oder weiß zu bleiben.</p>`);
};

class PreviewErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message: string }> {
  public state = { hasError: false, message: '' };

  public static getDerivedStateFromError(error: Error): { hasError: boolean; message: string } {
    return { hasError: true, message: error.message };
  }

  public componentDidCatch(error: Error): void {
    // Keep the GitHub Pages preview visible even if a browser-specific 3D runtime error is thrown.
    // eslint-disable-next-line no-console
    console.error(error);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return <section className="previewFallback"><strong>Serverroom Twin Preview</strong><h1>Dashboard konnte nicht gestartet werden</h1><p>{this.state.message || 'Unknown preview error.'}</p><p>Die Seite bleibt sichtbar, damit GitHub Pages nicht nur schwarz angezeigt wird.</p></section>;
    }
    return this.props.children;
  }
}

window.addEventListener('error', (event) => {
  if (event.error) renderFatalFallback(event.error);
});
window.addEventListener('unhandledrejection', (event) => renderFatalFallback(event.reason));

try {
  ReactDOM.render(
    <React.StrictMode>
      <PreviewErrorBoundary>
        <ServerRoomDigitalTwin
          description="Interactive 3D server room dashboard preview"
          racksListName="Preview Racks"
          devicesListName="Preview Devices"
          useDummyData={true}
          enableGlbLoading={true}
        />
      </PreviewErrorBoundary>
    </React.StrictMode>,
    document.getElementById('app-root')
  );
  window.setTimeout(hideFallbackIfDashboardRendered, 1200);
  window.setTimeout(keepFallbackVisibleIfAppIsBlank, 1800);
  window.setTimeout(keepFallbackVisibleIfAppIsBlank, 3500);
} catch (error) {
  renderFatalFallback(error);
}
