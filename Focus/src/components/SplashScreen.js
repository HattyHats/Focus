'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const [isFading, setIsFading] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [boxes, setBoxes] = useState([]);

  useEffect(() => {
    // Generate random background boxes
    const newBoxes = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      width: Math.random() * 200 + 100,
      height: Math.random() * 150 + 50,
      left: Math.random() * 90 + '%',
      top: Math.random() * 90 + '%',
      delay: Math.random() * 1.5,
    }));
    setBoxes(newBoxes);

    // Sequence timing
    const t1 = setTimeout(() => setShowSubtitle(true), 1200); // Glitch subtitle in after 1.2s
    const t2 = setTimeout(() => setShowLoader(true), 2000);   // Show spinner after 2s
    const t3 = setTimeout(() => setIsFading(true), 3500);     // Start fade out after 3.5s
    const t4 = setTimeout(() => {
      onComplete(); // Remove splash from DOM after fade out completes
    }, 4300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div 
      className={isFading ? 'splash-fade-out' : ''}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'var(--bg-color)', zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Background Pop-up Widgets */}
      {boxes.map(box => (
        <div 
          key={box.id} 
          className="splash-widget"
          style={{
            width: box.width, height: box.height, 
            left: box.left, top: box.top, 
            animationDelay: `${box.delay}s`
          }} 
        />
      ))}

      {/* Foreground Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        
        <h1 
          className="glitch-text" 
          data-text="Focus"
          style={{ 
            fontSize: '5rem', fontWeight: 800, margin: 0, letterSpacing: '4px',
            background: 'linear-gradient(to right, #60a5fa, #a78bfa)', 
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase'
          }}
        >
          Focus
        </h1>
        
        <div style={{ height: '30px', transition: 'opacity 0.3s', opacity: showSubtitle ? 1 : 0 }}>
          {showSubtitle && (
            <p 
              className="glitch-text" 
              data-text="Created by HattyHats"
              style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-secondary)', letterSpacing: '2px' }}
            >
              Created by HattyHats
            </p>
          )}
        </div>

        <div style={{ height: '40px', marginTop: '2rem', transition: 'opacity 0.5s', opacity: showLoader ? 1 : 0 }}>
          {showLoader && (
            <Loader2 className="animate-spin" size={32} color="var(--accent-color)" />
          )}
        </div>

      </div>
    </div>
  );
}
