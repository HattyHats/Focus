'use client';
import { useState, useEffect } from 'react';
import { Timer, X, Play, Pause, RotateCcw } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function PomodoroWidget({ id, onRemove , workspaces = [], onMove }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' or 'break'

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'work') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('work');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <Timer size={18} /> Pomodoro
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="glass-panel-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button 
            onClick={() => { setMode('work'); setTimeLeft(25*60); setIsActive(false); }}
            style={{ color: mode === 'work' ? 'var(--accent-color)' : 'var(--text-secondary)', fontWeight: mode === 'work' ? 600 : 400 }}
          >
            Work
          </button>
          <button 
            onClick={() => { setMode('break'); setTimeLeft(5*60); setIsActive(false); }}
            style={{ color: mode === 'break' ? 'var(--success-color)' : 'var(--text-secondary)', fontWeight: mode === 'break' ? 600 : 400 }}
          >
            Break
          </button>
        </div>
        
        <div style={{ fontSize: '4rem', fontWeight: 700, fontFamily: 'monospace', marginBottom: '1rem', color: mode === 'work' ? 'var(--text-primary)' : 'var(--success-color)' }}>
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={toggleTimer} style={{ 
            background: isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
            color: isActive ? 'var(--danger-color)' : 'var(--accent-color)',
            padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            {isActive ? <Pause size={18} /> : <Play size={18} />}
            {isActive ? 'Pause' : 'Start'}
          </button>
          <button onClick={resetTimer} style={{ 
            background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)',
            padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <RotateCcw size={18} /> Reset
          </button>
        </div>
      </div>
    </>
  );
}
