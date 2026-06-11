'use client';
import { useState } from 'react';
import { BookA, X, Search, Loader2 } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function DictionaryWidget({ id, onRemove , workspaces = [], onMove }) {
  const [word, setWord] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchWord = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Word not found.');
        throw new Error('Failed to fetch definition.');
      }
      const data = await res.json();
      setResult(data[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="glass-panel-header">
        <div className="glass-panel-title">
          <BookA size={18} /> Dictionary
        </div>
        <WidgetMoveDropdown workspaces={workspaces} onMove={onMove} />
          {onRemove && (
          <button onClick={onRemove} style={{ color: 'var(--text-secondary)' }} title="Remove">
            <X size={16} />
          </button>
        )}
      </div>
      <div className="glass-panel-content" style={{ display: 'flex', flexDirection: 'column' }}>
        <form onSubmit={searchWord} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            value={word}
            onChange={e => setWord(e.target.value)}
            placeholder="Search a word..."
            style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button type="submit" style={{ background: 'var(--accent-color)', color: '#fff', borderRadius: '4px', padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center' }}>
            <Search size={16} />
          </button>
        </form>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading && <div style={{ textAlign: 'center', marginTop: '1rem' }}><Loader2 className="animate-spin" size={24} color="var(--text-secondary)" /></div>}
          {error && <div style={{ color: 'var(--danger-color)', textAlign: 'center', marginTop: '1rem' }}>{error}</div>}
          
          {result && !loading && (
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>
                {result.word}
                {result.phonetic && <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginLeft: '0.5rem', fontWeight: 'normal' }}>{result.phonetic}</span>}
              </h2>
              
              {result.meanings.map((meaning, idx) => (
                <div key={idx} style={{ marginBottom: '1rem' }}>
                  <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{meaning.partOfSpeech}</div>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.95rem' }}>
                    {meaning.definitions.slice(0, 3).map((def, dIdx) => (
                      <li key={dIdx} style={{ marginBottom: '0.25rem' }}>
                        {def.definition}
                        {def.example && <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>"{def.example}"</div>}
                      </li>
                    ))}
                  </ul>
                  {meaning.synonyms?.length > 0 && (
                    <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                      <strong>Synonyms:</strong> {meaning.synonyms.slice(0, 5).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
