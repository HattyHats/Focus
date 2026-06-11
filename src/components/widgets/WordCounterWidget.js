'use client';
import { useState, useEffect } from 'react';
import { Type, X, Trash2 } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function WordCounterWidget({ id, onRemove , workspaces = [], onMove }) {
  const [text, setText] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`focus_dashboard_wordcounter_${id}`);
    if (saved) setText(saved);
  }, [id]);

  const handleChange = (e) => {
    setText(e.target.value);
    localStorage.setItem(`focus_dashboard_wordcounter_${id}`, e.target.value);
  };

  const clearText = () => {
    setText('');
    localStorage.removeItem(`focus_dashboard_wordcounter_${id}`);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  // Avg reading speed is 200-250 words per minute. Let's use 200.
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <Type size={18} /> Word Counter
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={clearText} style={{ color: 'var(--text-secondary)' }} title="Clear Text">
            <Trash2 size={16} />
          </button>
          <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
            <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove">
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="glass-panel-content" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        <div style={{ 
          display: 'flex', justifyContent: 'space-around', padding: '0.75rem', 
          borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-color)' }}>{wordCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Words</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--success-color)' }}>{charCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Characters</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#a855f7' }}>{wordCount > 0 ? `${readTimeMin}m` : '-'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Read Time</div>
          </div>
        </div>
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Paste or type text here to check length..."
          style={{
            flex: 1, width: '100%', height: '100%', resize: 'none', border: 'none',
            background: 'transparent', color: 'var(--text-primary)', padding: '1rem',
            outline: 'none', fontSize: '0.95rem', lineHeight: '1.5'
          }}
        />
      </div>
    </>
  );
}
