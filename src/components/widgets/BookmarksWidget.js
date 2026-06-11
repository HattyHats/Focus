'use client';
import { useState, useEffect } from 'react';
import { Bookmark, X, Plus } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function BookmarksWidget({ id, onRemove , workspaces = [], onMove }) {
  const [links, setLinks] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`focus_dashboard_bookmarks_${id}`);
    if (saved) {
      try { setLinks(JSON.parse(saved)); } catch (e) {}
    }
  }, [id]);

  const saveLinks = (updatedLinks) => {
    setLinks(updatedLinks);
    localStorage.setItem(`focus_dashboard_bookmarks_${id}`, JSON.stringify(updatedLinks));
  };

  const addLink = (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    
    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const title = newName.trim() || new URL(formattedUrl).hostname.replace('www.', '');
    
    const newLinkList = [...links, { id: Date.now(), title, url: formattedUrl }];
    saveLinks(newLinkList);
    setNewUrl('');
    setNewName('');
  };

  const removeLink = (linkId) => {
    saveLinks(links.filter(l => l.id !== linkId));
  };

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <Bookmark size={18} /> Quick Links
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="glass-panel-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <form onSubmit={addLink} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Name (optional)"
              style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', outline: 'none' }}
            />
            <input 
              type="text" 
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="URL (e.g. twitter.com)"
              style={{ flex: 2, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', outline: 'none' }}
            />
            <button type="submit" style={{ background: 'var(--accent-color)', color: '#fff', borderRadius: '4px', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center' }}>
              <Plus size={16} />
            </button>
          </div>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', overflowY: 'auto' }}>
          {links.map(link => (
            <div key={link.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px',
                  textAlign: 'center', border: '1px solid var(--glass-border)',
                  textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
                  fontSize: '0.9rem', color: 'var(--text-primary)', transition: 'all 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                {link.title}
              </a>
              <button 
                onClick={() => removeLink(link.id)}
                style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger-color)', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
