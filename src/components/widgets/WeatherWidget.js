'use client';
import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, Wind, Loader2, X } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function WeatherWidget({ id, onRemove , workspaces = [], onMove }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // We'll use geolocation if available, otherwise default to a major city (e.g. New York)
    const fetchWeather = async (lat = 40.71, lon = -74.00, city = 'New York') => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit`);
        if (!res.ok) throw new Error('Failed to load weather');
        const data = await res.json();
        
        setWeather({
          city,
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
          wind: data.current.wind_speed_10m,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Local Area'),
        () => fetchWeather() // fallback to NY
      );
    } else {
      fetchWeather();
    }
  }, []);

  const getWeatherIcon = (code) => {
    if (code === 0 || code === 1) return <Sun size={48} color="#fbbf24" />;
    if (code >= 2 && code <= 3) return <Cloud size={48} color="#94a3b8" />;
    if (code >= 51 && code <= 67) return <CloudRain size={48} color="#60a5fa" />;
    if (code >= 71 && code <= 77) return <Snowflake size={48} color="#e2e8f0" />;
    return <Cloud size={48} color="#94a3b8" />;
  };

  const getWeatherDesc = (code) => {
    if (code === 0) return 'Clear sky';
    if (code >= 1 && code <= 3) return 'Partly cloudy';
    if (code >= 51 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    return 'Cloudy';
  };

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <Cloud size={18} /> Weather (Live)
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="glass-panel-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : error ? (
          <div style={{ color: 'var(--danger-color)', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        ) : weather && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ marginBottom: '0.5rem' }}>{getWeatherIcon(weather.code)}</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 600, margin: '0.5rem 0' }}>{weather.temp}°F</div>
            <div style={{ fontSize: '1.1rem' }}>{weather.city}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {getWeatherDesc(weather.code)} • Wind: {weather.wind} mph
            </div>
          </div>
        )}
      </div>
    </>
  );
}
