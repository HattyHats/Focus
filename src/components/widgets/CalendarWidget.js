'use client';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function CalendarWidget({ id, onRemove , workspaces = [], onMove }) {
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();
  
  const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentYear, today.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => null);
  
  const allDays = [...blanks, ...days];

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <CalendarIcon size={18} /> Calendar
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="glass-panel-content">
        <div style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 600 }}>
          {currentMonth} {currentYear}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center', fontSize: '0.8rem' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{day}</div>
          ))}
          {allDays.map((day, i) => (
            <div 
              key={i} 
              style={{ 
                padding: '0.25rem', 
                borderRadius: '4px',
                background: day === today.getDate() ? 'var(--accent-color)' : 'transparent',
                color: day === today.getDate() ? '#fff' : 'inherit'
              }}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
