'use client';
import { useState, useEffect } from 'react';
import { LayoutGrid, X, Loader2, RefreshCw } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function CryptoHeatmapWidget({ id, onRemove , workspaces = [], onMove }) {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHeatmap = async () => {
    try {
      const startTime = Date.now();
      const res = await fetch(`/api/crypto-heatmap?t=${startTime}`);
      if (!res.ok) throw new Error('Failed to load heatmap');
      const data = await res.json();
      setCoins(data.items);
      
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) await new Promise(r => setTimeout(r, 500 - elapsed));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
    const interval = setInterval(fetchHeatmap, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchHeatmap();
  };

  // Find max and min market cap for proportional sizing
  const maxCap = coins.length > 0 ? Math.max(...coins.map(c => c.marketCap)) : 1;

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <LayoutGrid size={18} /> Crypto Heatmap
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            onClick={handleRefresh} 
            style={{ color: 'var(--accent-color)', cursor: 'pointer' }} 
            title="Refresh Heatmap"
            disabled={isRefreshing || loading}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
            <button onClick={onRemove} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} title="Remove">
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="glass-panel-content" style={{ padding: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '2px', alignContent: 'flex-start' }}>
        {loading && coins.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', color: 'var(--text-secondary)' }}>
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : error ? (
          <div style={{ color: 'var(--danger-color)', width: '100%', textAlign: 'center', marginTop: '1rem' }}>
            {error}
          </div>
        ) : (
          coins.map(coin => {
            const isPositive = coin.change >= 0;
            // Map percentage change to color intensity
            const intensity = Math.min(Math.abs(coin.change) / 10, 1); // cap at 10% change for max intensity
            const baseColor = isPositive ? '16, 185, 129' : '239, 68, 68'; // Emerald or Red
            const bgColor = `rgba(${baseColor}, ${0.3 + (intensity * 0.7)})`;
            
            // Proportional flexGrow approximation
            const relativeSize = coin.marketCap / maxCap;
            // Boost small coins so they are still visible
            const flexGrow = Math.max(relativeSize * 100, 5);
            
            return (
              <div 
                key={coin.id}
                className="heatmap-block"
                title={`${coin.name} (${coin.symbol})\n$${coin.price}\nChange: ${coin.change ? coin.change.toFixed(2) : 0}%`}
                style={{
                  flexGrow: flexGrow,
                  flexBasis: `${Math.max(relativeSize * 30, 10)}%`, // minimum 10% width
                  minHeight: '60px',
                  backgroundColor: bgColor,
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'transform 0.1s, z-index 0.1s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <span style={{ fontWeight: 700, fontSize: flexGrow > 20 ? '1rem' : '0.75rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                  {coin.symbol}
                </span>
                {flexGrow > 15 && (
                  <span style={{ fontSize: '0.7rem', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {coin.change > 0 ? '+' : ''}{coin.change ? coin.change.toFixed(2) : 0}%
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
      <style jsx>{`
        .heatmap-block:hover {
          transform: scale(1.05);
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.5);
        }
      `}</style>
    </>
  );
}
