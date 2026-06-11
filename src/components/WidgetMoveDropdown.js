'use client';
import { useState, useEffect } from 'react';
import { ArrowRightToLine } from 'lucide-react';

export default function WidgetMoveDropdown({ workspaces = [], onMove }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.move-widget-dropdown')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!workspaces || workspaces.length === 0) return null;

  return (
    <div className="move-widget-dropdown" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }} 
        title="Send to Tab"
      >
        <ArrowRightToLine size={16} />
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '150px',
          background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)',
          border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.25rem',
          display: 'flex', flexDirection: 'column', zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.25rem 0.5rem', marginBottom: '0.25rem', borderBottom: '1px solid var(--glass-border)' }}>
            Move to...
          </div>
          {workspaces.map(ws => (
            <button
              key={ws.id}
              onClick={() => { onMove(ws.id); setIsOpen(false); }}
              style={{
                textAlign: 'left', padding: '0.5rem', color: 'var(--text-primary)',
                background: 'transparent', border: 'none', borderRadius: '4px', cursor: 'pointer'
              }}
              onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} 
              onMouseOut={e=>e.currentTarget.style.background='transparent'}
            >
              {ws.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
