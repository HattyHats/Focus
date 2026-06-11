'use client';
import { Music, X } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';

export default function HattyMusicWidget({ id, onRemove, workspaces = [], onMove, isGlobal }) {
  const embedUrl = "https://hattyhats.github.io/chill-with-hatty/";

  if (isGlobal) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingRight: '0.5rem', background: '#000' }}>
        <iframe 
          style={{ width: '100%', height: '160px', border: 'none' }} 
          src={embedUrl} 
          allow="autoplay; encrypted-media; picture-in-picture" 
          allowFullScreen
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
          <Music size={18} /> Chill With Hatty
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="glass-panel-content" style={{ padding: 0, overflow: 'hidden', background: '#000' }}>
        <iframe 
          style={{ width: '100%', height: '100%', border: 'none' }} 
          src={embedUrl} 
          allow="autoplay; encrypted-media; picture-in-picture" 
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          allowFullScreen
        />
      </div>
    </>
  );
}
