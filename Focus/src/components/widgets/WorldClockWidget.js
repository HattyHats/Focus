'use client';
import { useState, useEffect } from 'react';
import { Globe, X } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function WorldClockWidget({ id, onRemove , workspaces = [], onMove }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timezones = [
    { name: 'New York', tz: 'America/New_York' },
    { name: 'London', tz: 'Europe/London' },
    { name: 'Tokyo', tz: 'Asia/Tokyo' },
  ];

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <Globe size={18} /> World Clock
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="glass-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
        {timezones.map(tz => (
          <div key={tz.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{tz.name}</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {time.toLocaleTimeString('en-US', { timeZone: tz.tz, hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
