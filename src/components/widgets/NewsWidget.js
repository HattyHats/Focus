'use client';
import { useState, useEffect } from 'react';
import { Newspaper, X, Loader2, RefreshCw } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function NewsWidget({ id, onRemove, topic = 'tech', title = 'Tech News' , workspaces = [], onMove }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    try {
      const startTime = Date.now();
      // Add a timestamp cache-buster so the browser doesn't serve stale data
      const res = await fetch(`/api/news?topic=${topic}&t=${startTime}`);
      if (!res.ok) throw new Error('Failed to load news');
      const data = await res.json();
      setNews(data.items);
      
      // Ensure the spin animation plays for at least 500ms so the user can see it
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [topic]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNews();
  };

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <Newspaper size={18} /> {title}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button 
            onClick={handleRefresh} 
            style={{ color: 'var(--accent-color)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }} 
            title="Refresh News"
            disabled={isRefreshing || loading}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
            <button onClick={onRemove} style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }} title="Remove">
              <X size={16} />
            </button>
          )}
        </div>
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
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {news.map(item => {
              const date = new Date(item.time);
              const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={item.id} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.4', transition: 'color 0.2s' }} 
                        onMouseOver={e => e.currentTarget.style.color = 'var(--accent-hover)'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--text-primary)'}>
                      {item.title}
                    </h4>
                  </a>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>{item.source}</span>
                    <span>{timeString}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
