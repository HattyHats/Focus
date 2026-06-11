'use client';
import { useState, useEffect } from 'react';
import { Image as ImageIcon, Check, Upload, Trash2 } from 'lucide-react';
import WidgetMoveDropdown from '../WidgetMoveDropdown';


export default function VisionBoardWidget({ id }) {
  const [imageUrl, setImageUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(`focus_vision_${id}`);
    if (saved) {
      setImageUrl(saved);
      setIsEditing(false);
    }
  }, [id]);

  const saveImage = (url) => {
    setImageUrl(url);
    localStorage.setItem(`focus_vision_${id}`, url);
    setIsEditing(false);
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (inputUrl) {
      saveImage(inputUrl);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress the image so we don't blow up LocalStorage
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Output as low-quality JPEG to save space
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        saveImage(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageUrl('');
    setInputUrl('');
    localStorage.removeItem(`focus_vision_${id}`);
    setIsEditing(true);
  };

  if (!isEditing && imageUrl) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', group: 'true' }}>
        <img 
          src={imageUrl} 
          alt="Vision Board" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <button
          onClick={clearImage}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff',
            width: '32px', height: '32px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', backdropFilter: 'blur(4px)'
          }}
          title="Clear Image"
        >
          <Trash2 size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', justifyContent: 'center' }}>
      <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
        <ImageIcon size={20} color="var(--accent-color)" /> Focus Image
      </h3>
      
      <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Paste an image URL or upload a file.
      </p>

      <form onSubmit={handleUrlSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input 
          type="url" 
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          style={{
            flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
            padding: '0.5rem 1rem', borderRadius: '8px', color: '#fff', outline: 'none'
          }}
        />
        <button 
          type="submit"
          style={{
            background: 'var(--accent-color)', border: 'none', padding: '0 1rem',
            borderRadius: '8px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center'
          }}
        >
          <Check size={18} />
        </button>
      </form>

      <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>OR</div>

      <label style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--glass-border)',
        padding: '1rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
      }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
        <Upload size={18} color="var(--accent-color)" />
        <span style={{ fontSize: '0.9rem' }}>Upload from Computer</span>
        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
      </label>

    </div>
  );
}
