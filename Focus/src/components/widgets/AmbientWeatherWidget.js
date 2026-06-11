'use client';
import { useState, useEffect, useRef } from 'react';
import { Cloud, X, Search, MapPin, Loader2 } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function AmbientWeatherWidget({ id, onRemove , workspaces = [], onMove }) {
  const [city, setCity] = useState('');
  const [location, setLocation] = useState(null); // { name, lat, lon }
  const [weather, setWeather] = useState(null); // { temp, code, wind }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canvasRef = useRef(null);
  const requestRef = useRef();
  const particlesRef = useRef([]);

  // Load saved location on mount
  useEffect(() => {
    const saved = localStorage.getItem(`focus_weather_${id}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setLocation(parsed);
      fetchWeather(parsed.lat, parsed.lon);
    }
  }, [id]);

  const searchCity = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
      const data = await res.json();
      if (!data.results || data.results.length === 0) throw new Error('City not found');
      
      const loc = { name: data.results[0].name, lat: data.results[0].latitude, lon: data.results[0].longitude };
      setLocation(loc);
      localStorage.setItem(`focus_weather_${id}`, JSON.stringify(loc));
      await fetchWeather(loc.lat, loc.lon);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setCity('');
    }
  };

  const fetchWeather = async (lat, lon) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit`);
      const data = await res.json();
      setWeather({
        temp: data.current.temperature_2m,
        code: data.current.weather_code,
        wind: data.current.wind_speed_10m
      });
      initParticles(data.current.weather_code);
    } catch (err) {
      console.error(err);
    }
  };

  // Weather codes mapping
  // 0: Clear
  // 1-3: Cloudy
  // 45-48: Fog
  // 51-67, 80-82: Rain
  // 71-77, 85-86: Snow
  const getWeatherType = (code) => {
    if (code === undefined) return 'clear';
    if (code >= 51 && code <= 67) return 'rain';
    if (code >= 80 && code <= 82) return 'rain';
    if (code >= 95) return 'rain'; // thunderstorm
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 85 && code <= 86) return 'snow';
    if (code >= 1 && code <= 48) return 'clouds';
    return 'clear';
  };

  const initParticles = (code) => {
    const type = getWeatherType(code);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let count = 0;
    particlesRef.current = [];

    if (type === 'rain') count = 120;
    if (type === 'snow') count = 200;
    if (type === 'clouds') count = 6; // big fluffy clouds

    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: type === 'clouds' ? (Math.random() * (canvas.height / 2)) : Math.random() * canvas.height,
        size: type === 'clouds' ? (40 + Math.random() * 60) : type === 'snow' ? (1 + Math.random() * 3) : (1 + Math.random() * 2),
        speed: type === 'rain' ? (15 + Math.random() * 15) : type === 'snow' ? (1 + Math.random() * 2) : (0.2 + Math.random() * 0.4),
        angle: type === 'rain' ? 8 : 0, // steeper angle for rain
        opacity: Math.random() * 0.8 + 0.2
      });
    }
  };

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        if (weather) initParticles(weather.code);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const drawCloud = (ctx, x, y, size, opacity) => {
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, size, Math.PI * 0.5, Math.PI * 1.5);
      ctx.arc(x + size * 0.7, y - size * 0.5, size * 0.9, Math.PI * 1, Math.PI * 1.85);
      ctx.arc(x + size * 1.5, y - size * 0.4, size * 0.7, Math.PI * 1.37, Math.PI * 1.91);
      ctx.arc(x + size * 2.2, y, size * 0.8, Math.PI * 1.5, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
    };

    const draw = () => {
      // Draw OPAQUE background to prevent blurring from glass-panel
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const type = getWeatherType(weather?.code);

      if (type === 'clear' && weather) {
        // Draw a sun
        const gradient = ctx.createRadialGradient(canvas.width - 50, 50, 0, canvas.width - 50, 50, 80);
        gradient.addColorStop(0, 'rgba(253, 224, 71, 0.4)');
        gradient.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(canvas.width - 50, 50, 80, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(canvas.width - 50, 50, 20, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 'clouds' || type === 'rain' || type === 'snow') {
        // Draw some ambient background clouds for atmosphere
        drawCloud(ctx, canvas.width * 0.2, 40, 50, 0.1);
        drawCloud(ctx, canvas.width * 0.7, 60, 70, 0.05);
      }

      particlesRef.current.forEach(p => {
        if (type === 'rain') {
          ctx.strokeStyle = `rgba(96, 165, 250, ${p.opacity})`; // Bright Blue
          ctx.lineWidth = p.size;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.angle, p.y + p.speed * 1.2);
          ctx.stroke();
          
          p.x -= p.angle;
          p.y += p.speed;
        } else if (type === 'snow') {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          
          p.x += Math.sin(p.y / 30) * 0.5; // horizontal drift
          p.y += p.speed;
        } else if (type === 'clouds') {
          drawCloud(ctx, p.x, p.y, p.size, p.opacity);
          p.x += p.speed;
        }

        // Wrap around logic
        if (p.y > canvas.height + 50) {
          p.y = -50;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + p.size * 3) p.x = -p.size * 3;
        if (p.x < -p.size * 3) p.x = canvas.width + p.size * 3;
      });

      requestRef.current = requestAnimationFrame(draw);
    };

    requestRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [weather]);


  const clearLocation = () => {
    localStorage.removeItem(`focus_weather_${id}`);
    setLocation(null);
    setWeather(null);
    particlesRef.current = [];
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <>
      <div className="glass-panel-header" style={{ position: 'relative', zIndex: 10 }}>
        <div className="glass-panel-title">
          <Cloud size={18} /> Ambient Weather
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Canvas Layer - Sent to Back */}
      <canvas 
        ref={canvasRef} 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }} 
      />

      {/* Content Layer - Sent to Front */}
      <div className="glass-panel-content" style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
        {!location ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', marginBottom: '1rem' }}>Enter a city to watch the weather.</p>
            <form onSubmit={searchCity} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. New York, London"
                style={{
                  flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
                  padding: '0.75rem', borderRadius: '8px', color: '#fff', outline: 'none'
                }}
              />
              <button type="submit" disabled={loading} style={{ background: 'var(--accent-color)', border: 'none', borderRadius: '8px', padding: '0 1rem', color: '#fff' }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </button>
            </form>
            {error && <div style={{ color: 'var(--danger-color)', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>{error}</div>}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }} onClick={clearLocation} title="Change Location">
              <MapPin size={16} color="var(--accent-color)" />
              <h3 style={{ margin: 0 }}>{location.name}</h3>
            </div>
            
            {weather ? (
              <div style={{ textAlign: 'center', backdropFilter: 'blur(2px)', padding: '1rem', borderRadius: '16px', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: 1 }}>{Math.round(weather.temp)}&deg;</div>
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textTransform: 'capitalize' }}>
                  {getWeatherType(weather.code)}
                </div>
              </div>
            ) : (
              <Loader2 className="animate-spin" size={24} color="var(--text-secondary)" />
            )}
          </div>
        )}
      </div>
    </>
  );
}
