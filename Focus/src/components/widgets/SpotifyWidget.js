'use client';
import { Music, X } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function SpotifyWidget({ id, onRemove, workspaces = [], onMove, isGlobal }) {
  // A chill lofi playlist embed url
  const embedUrl = "https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRwui0ExPn?utm_source=generator&theme=0";

  if (isGlobal) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingRight: '0.5rem', background: '#282828' }}>
        <iframe 
          style={{ width: '100%', height: '152px', border: 'none' }} 
          src={embedUrl} 
          allowFullScreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        />
        {onRemove && (
          <button onClick={onRemove} style={{ color: '#fff', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '0.25rem', cursor: 'pointer', marginLeft: '0.5rem', display: 'flex' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <Music size={18} /> Lofi Radio (Spotify)
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="glass-panel-content" style={{ padding: 0, overflow: 'hidden' }}>
        <iframe 
          style={{ borderRadius: '0 0 16px 16px', width: '100%', height: '100%', border: 'none' }} 
          src={embedUrl} 
          allowFullScreen="" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        />
      </div>
    </>
  );
}
