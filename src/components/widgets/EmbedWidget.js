'use client';
import { useState, useEffect } from 'react';
import { Globe, X, Link } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';

export default function EmbedWidget({ id, onRemove, workspaces = [], onMove }) {
  const [url, setUrl] = useState('');
  const [submittedUrl, setSubmittedUrl] = useState('');

  // Persist URL in localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`focus_embed_${id}`);
    if (saved) setSubmittedUrl(saved);
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let finalUrl = url;
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    setSubmittedUrl(finalUrl);
    localStorage.setItem(`focus_embed_${id}`, finalUrl);
  };

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <Globe size={18} /> Embedded Website
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
        {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="glass-panel-content" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {!submittedUrl ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <Globe size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 1rem 0' }}>Embed a Website</h3>
            <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
                autoFocus
              />
              <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--accent-color)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                Embed
              </button>
            </form>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
              Note: Highly secure sites (like Google or banking sites) cannot be embedded.
            </p>
          </div>
        ) : (
          <div style={{ flex: 1, position: 'relative' }}>
            <iframe 
              src={submittedUrl}
              style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
            {/* Edit Button Overlay */}
            <button 
              onClick={() => { setUrl(submittedUrl); setSubmittedUrl(''); }}
              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', backdropFilter: 'blur(4px)' }}
              title="Edit URL"
            >
              <Link size={14} /> <span style={{ fontSize: '0.8rem' }}>Edit URL</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
