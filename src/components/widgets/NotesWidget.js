'use client';
import { useState, useEffect } from 'react';
import { PencilLine, X } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function NotesWidget({ id, onRemove , workspaces = [], onMove }) {
  const [note, setNote] = useState('');

  useEffect(() => {
    const savedNote = localStorage.getItem(`focus_dashboard_notes_${id}`);
    if (savedNote) setNote(savedNote);
  }, [id]);

  const handleChange = (e) => {
    setNote(e.target.value);
    localStorage.setItem(`focus_dashboard_notes_${id}`, e.target.value);
  };

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <PencilLine size={18} /> Notes
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="glass-panel-content" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
        <textarea
          value={note}
          onChange={handleChange}
          placeholder="Type your notes here..."
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            resize: 'none',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-primary)',
            padding: '1rem',
            outline: 'none',
            fontSize: '1rem',
            lineHeight: '1.5'
          }}
        />
      </div>
    </>
  );
}
