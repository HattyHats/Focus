'use client';
import { useState } from 'react';
import { Calculator, X } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function CalculatorWidget({ id, onRemove , workspaces = [], onMove }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handlePress = (val) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
      return;
    }
    
    if (val === '=') {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(equation + display);
        setDisplay(String(result));
        setEquation('');
      } catch (e) {
        setDisplay('Error');
      }
      return;
    }

    if (['+', '-', '*', '/'].includes(val)) {
      setEquation(equation + display + val);
      setDisplay('0');
      return;
    }

    if (display === '0') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    'C', '0', '=', '+'
  ];

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <Calculator size={18} /> Calculator
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="glass-panel-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '0.75rem', 
          borderRadius: '8px', 
          textAlign: 'right', 
          fontSize: '1.5rem',
          marginBottom: '1rem',
          minHeight: '3rem',
          wordBreak: 'break-all'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minHeight: '1rem' }}>{equation}</div>
          {display}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', flex: 1 }}>
          {buttons.map(btn => (
            <button 
              key={btn} 
              onClick={() => handlePress(btn)}
              style={{
                background: ['+', '-', '*', '/', '=', 'C'].includes(btn) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: ['+', '-', '*', '/', '=', 'C'].includes(btn) ? 'var(--accent-hover)' : 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = ['+', '-', '*', '/', '=', 'C'].includes(btn) ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
