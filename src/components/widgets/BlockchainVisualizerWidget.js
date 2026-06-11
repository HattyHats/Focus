'use client';
import { useState, useEffect, useRef } from 'react';
import { Activity, X } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';

export default function BlockchainVisualizerWidget({ id, onRemove, workspaces = [], onMove }) {
  const [txCount, setTxCount] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [status, setStatus] = useState('Connecting...');
  const [whaleAlert, setWhaleAlert] = useState(null); // { val: number, id: string }
  
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const requestRef = useRef();
  const btcPriceRef = useRef(60000); // fallback price

  useEffect(() => {
    // 0. Fetch initial BTC price using Binance to avoid CoinGecko rate limits/CORS
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
      .then(r => {
        if (!r.ok) throw new Error('Network response was not ok');
        return r.json();
      })
      .then(data => {
        if (data.price) btcPriceRef.current = parseFloat(data.price);
      })
      .catch(e => {
        // Silently catch to prevent Next.js dev overlay from popping up.
        // It will just fallback to the default 60000 price.
        console.log('Using fallback BTC price.', e.message);
      });

    // 1. Setup WebSocket
    const ws = new WebSocket('wss://ws.blockchain.info/inv');

    ws.onopen = () => {
      setStatus('Live');
      ws.send(JSON.stringify({ op: 'unconfirmed_sub' }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.op === 'utx') {
          // Calculate total transaction value by summing all outputs
          let totalSatoshi = 0;
          if (data.x && data.x.out) {
            data.x.out.forEach(output => {
              if (output.value) totalSatoshi += output.value;
            });
          }
          
          const btcVal = totalSatoshi / 100000000;
          const usdVal = btcVal * btcPriceRef.current;
          
          if (!isNaN(usdVal) && usdVal > 0) {
            setTxCount(prev => prev + 1);
            setTotalVolume(prev => prev + usdVal);
            
            if (usdVal > 100000) {
              setWhaleAlert({ val: usdVal, id: data.x.hash });
              setTimeout(() => setWhaleAlert(null), 3000);
            }
            
            spawnParticle(usdVal);
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    };

    ws.onerror = () => setStatus('Error');
    ws.onclose = () => setStatus('Disconnected');

    // 2. Setup Canvas Physics
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Resize canvas to match parent
    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const formatShortUSD = (val) => {
      if (val >= 1000000) return `+$${(val/1000000).toFixed(1)}M`;
      if (val >= 1000) return `+$${(val/1000).toFixed(1)}K`;
      return `+$${Math.floor(val)}`;
    };

    const draw = () => {
      // Clear background
      ctx.fillStyle = '#0f172a'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#a78bfa';

      particlesRef.current.forEach((p, index) => {
        ctx.fillStyle = p.isWhale ? '#fbbf24' : accentColor; // Gold for whales
        ctx.font = `${p.isWhale ? 'bold ' : ''}${p.size}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        
        ctx.fillText(formatShortUSD(p.val), p.x, p.y);

        // Move down
        p.y += p.speed;

        // Remove if off screen
        if (p.y > canvas.height + p.size) {
          particlesRef.current.splice(index, 1);
        }
      });

      requestRef.current = requestAnimationFrame(draw);
    };

    requestRef.current = requestAnimationFrame(draw);

    return () => {
      ws.close();
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const spawnParticle = (usdVal) => {
    if (!canvasRef.current) return;
    
    // Determine size and speed based on USD value
    let size = 12;
    let speed = 1.5 + Math.random();
    let isWhale = false;
    
    if (usdVal > 1000000) { size = 32; speed = 0.5; isWhale = true; }
    else if (usdVal > 100000) { size = 24; speed = 1; isWhale = true; }
    else if (usdVal > 10000) { size = 16; speed = 1.5; }
    else if (usdVal < 100) { size = 8; speed = 3; }

    particlesRef.current.push({
      x: Math.random() * (canvasRef.current.width - 40) + 20, // keep within bounds
      y: -30,
      speed: speed,
      size: size,
      val: usdVal,
      isWhale: isWhale
    });
    
    // Cap particles to prevent lag
    if (particlesRef.current.length > 200) {
      particlesRef.current.shift();
    }
  };

  const formatLargeUSD = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <>
      <div className="glass-panel-header" style={{ position: 'relative', zIndex: 10 }}>
        <div className="glass-panel-title">
          <Activity size={18} /> Live BTC Volume
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', 
            color: status === 'Live' ? 'var(--success-color)' : 'var(--text-secondary)',
            marginRight: '0.5rem'
          }}>
            <div style={{ 
              width: '8px', height: '8px', borderRadius: '50%', 
              background: status === 'Live' ? 'var(--success-color)' : 'var(--text-secondary)',
              boxShadow: status === 'Live' ? '0 0 8px var(--success-color)' : 'none'
            }} />
            {status}
          </div>
          <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
            <button onClick={onRemove} style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }} title="Remove">
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="glass-panel-content" style={{ padding: 0, position: 'relative', background: '#0f172a', overflow: 'hidden' }}>
        
        {/* Whale Alert Overlay */}
        {whaleAlert && (
          <div style={{
            position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(251, 191, 36, 0.2)', border: '1px solid #fbbf24',
            padding: '0.5rem 1rem', borderRadius: '24px', zIndex: 20,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            animation: 'widget-pop 0.3s ease-out forwards', color: '#fbbf24',
            fontWeight: 'bold', whiteSpace: 'nowrap', boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)'
          }}>
            🚨 WHALE: {formatLargeUSD(whaleAlert.val)}
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        
        {/* Overlay HUD */}
        <div style={{ 
          position: 'absolute', bottom: '1rem', right: '1rem', 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          padding: '0.5rem 1rem', borderRadius: '8px',
          border: '1px solid var(--glass-border)',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
          zIndex: 10
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Volume Moved</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success-color)', fontVariantNumeric: 'tabular-nums' }}>
            {formatLargeUSD(totalVolume)}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {txCount.toLocaleString()} TXs
          </span>
        </div>
      </div>
    </>
  );
}
