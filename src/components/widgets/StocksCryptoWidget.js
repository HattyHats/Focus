'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, X, Loader2, Plus, Trash2 } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


const DEFAULT_COINS = ['bitcoin', 'ethereum', 'solana', 'cardano'];

export default function StocksCryptoWidget({ id, onRemove , workspaces = [], onMove }) {
  const [trackedCoins, setTrackedCoins] = useState(DEFAULT_COINS);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCoinId, setNewCoinId] = useState('');

  useEffect(() => {
    const savedCoins = localStorage.getItem(`focus_crypto_coins_${id}`);
    if (savedCoins) {
      try {
        setTrackedCoins(JSON.parse(savedCoins));
      } catch (e) {
        setTrackedCoins(DEFAULT_COINS);
      }
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      if (trackedCoins.length === 0) {
        setAssets([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/crypto?ids=${trackedCoins.join(',')}`);
        if (!res.ok) throw new Error('Failed to load markets');
        const data = await res.json();
        
        const sortedAssets = [];
        const missingCoins = [];

        trackedCoins.forEach(coinId => {
          const found = data.items.find(item => item.id === coinId);
          if (found) {
            sortedAssets.push(found);
          } else {
            missingCoins.push(coinId);
          }
        });

        // If a user typed an invalid coin (e.g. "btc" instead of "bitcoin"), remove it and warn
        if (missingCoins.length > 0) {
          setError(`Could not find: ${missingCoins.join(', ')}. Please use full coin names (e.g. 'bitcoin', 'dogecoin').`);
          const validCoins = trackedCoins.filter(c => !missingCoins.includes(c));
          setTrackedCoins(validCoins);
          localStorage.setItem(`focus_crypto_coins_${id}`, JSON.stringify(validCoins));
          setTimeout(() => setError(null), 5000);
        } else {
          setError(null);
        }

        setAssets(sortedAssets);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [trackedCoins]);

  const handleAddCoin = (e) => {
    e.preventDefault();
    if (!newCoinId.trim()) return;
    
    const normalizedId = newCoinId.trim().toLowerCase();
    if (!trackedCoins.includes(normalizedId)) {
      const newCoins = [...trackedCoins, normalizedId];
      setTrackedCoins(newCoins);
      localStorage.setItem(`focus_crypto_coins_${id}`, JSON.stringify(newCoins));
    }
    setNewCoinId('');
    setIsAdding(false);
  };

  const removeCoin = (coinId) => {
    const newCoins = trackedCoins.filter(c => c !== coinId);
    setTrackedCoins(newCoins);
    localStorage.setItem(`focus_crypto_coins_${id}`, JSON.stringify(newCoins));
  };

  const formatPrice = (price) => {
    if (price < 0.01) return `$${price}`; // for meme coins
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const formatChange = (change) => {
    if (change === null || change === undefined) return '0.00%';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} /> Markets
          <button 
            onClick={() => setIsAdding(!isAdding)} 
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--accent-color)', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 
            }}
            title="Add Coin"
          >
            <Plus size={16} />
          </button>
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove Widget">
            <X size={16} />
          </button>
        )}
      </div>
      
      <div className="glass-panel-content" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {isAdding && (
          <form onSubmit={handleAddCoin} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="text" 
              value={newCoinId}
              onChange={(e) => setNewCoinId(e.target.value)}
              placeholder="CoinGecko ID (e.g. dogecoin)"
              style={{
                flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
                padding: '0.5rem', borderRadius: '4px', color: '#fff', outline: 'none', fontSize: '0.85rem'
              }}
              autoFocus
            />
            <button type="submit" style={{ background: 'var(--accent-color)', border: 'none', borderRadius: '4px', padding: '0 0.75rem', color: '#fff', cursor: 'pointer' }}>
              Add
            </button>
          </form>
        )}

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.25rem' }}>
          {loading && assets.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : error ? (
            <div style={{ color: 'var(--danger-color)', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </div>
          ) : trackedCoins.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2rem' }}>
              No coins tracked. Click + to add one.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {assets.map(asset => {
                const isPositive = asset.change >= 0;
                return (
                  <div key={asset.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }} className="crypto-asset-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        onClick={() => removeCoin(asset.id)}
                        className="crypto-remove-btn"
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.2)', border: 'none', color: '#ef4444',
                          width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer',
                          display: 'none', alignItems: 'center', justifyContent: 'center', padding: 0
                        }}
                        title="Stop tracking"
                      >
                        <Trash2 size={12} />
                      </button>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{asset.symbol}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{asset.name}</span>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formatPrice(asset.price)}</div>
                      <div style={{ 
                        fontSize: '0.85rem', 
                        color: isPositive ? 'var(--success-color)' : 'var(--danger-color)',
                        display: 'inline-block',
                        background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginTop: '4px'
                      }}>
                        {formatChange(asset.change)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .crypto-asset-row:hover .crypto-remove-btn {
          display: flex !important;
        }
      `}</style>
    </>
  );
}
