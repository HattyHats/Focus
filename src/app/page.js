'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, X, FolderPlus, Trash2 } from 'lucide-react';
import { WIDGET_TYPES, AVAILABLE_WIDGETS } from '@/components/WidgetRegistry';
import SplashScreen from '@/components/SplashScreen';

const DashboardGrid = dynamic(() => import('@/components/DashboardGrid'), { ssr: false });

const DEFAULT_WIDGETS = [
  { i: 'notes-1', type: 'NOTES' },
  { i: 'news-1', type: 'NEWS_AI' },
  { i: 'markets-1', type: 'MARKETS' },
  { i: 'calc-1', type: 'CALCULATOR' },
  { i: 'cal-1', type: 'CALENDAR' },
];

const DEFAULT_LAYOUT = {
  lg: [
    { i: 'notes-1', x: 0, y: 0, w: 4, h: 4 },
    { i: 'news-1', x: 4, y: 0, w: 4, h: 6 },
    { i: 'markets-1', x: 8, y: 0, w: 4, h: 4 },
    { i: 'calc-1', x: 0, y: 4, w: 4, h: 4 },
    { i: 'cal-1', x: 8, y: 4, w: 4, h: 4 },
  ]
};

export default function Home() {
  const [workspaces, setWorkspaces] = useState([
    { id: 'default', name: 'Main', widgets: DEFAULT_WIDGETS, layouts: DEFAULT_LAYOUT }
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('default');
  const [globalWidgets, setGlobalWidgets] = useState([]);
  
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setMounted(true);

    const hasSeenSplash = sessionStorage.getItem('focus_dashboard_has_seen_splash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }

    const savedWorkspaces = localStorage.getItem('focus_dashboard_workspaces');
    const savedActiveId = localStorage.getItem('focus_dashboard_active_workspace');
    const savedGlobals = localStorage.getItem('focus_dashboard_global_widgets');
    
    if (savedGlobals) {
      try { setGlobalWidgets(JSON.parse(savedGlobals)); } catch (e) {}
    }

    if (savedWorkspaces) {
      try {
        setWorkspaces(JSON.parse(savedWorkspaces));
        if (savedActiveId) setActiveWorkspaceId(savedActiveId);
      } catch (e) {
        // use default
      }
    } else {
      // Migration from Phase 3 legacy state
      const legacyWidgets = localStorage.getItem('focus_dashboard_widgets');
      const legacyLayout = localStorage.getItem('focus_dashboard_layout');
      if (legacyWidgets && legacyLayout) {
        try {
          const w = JSON.parse(legacyWidgets);
          const l = JSON.parse(legacyLayout);
          const migrated = [{ id: 'default', name: 'Main', widgets: w, layouts: l }];
          setWorkspaces(migrated);
          saveAllWorkspaces(migrated, 'default');
        } catch (e) {}
      }
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('focus_dashboard_has_seen_splash', 'true');
  };

  const saveAllWorkspaces = (newWorkspaces, newActiveId) => {
    setWorkspaces(newWorkspaces);
    setActiveWorkspaceId(newActiveId);
    localStorage.setItem('focus_dashboard_workspaces', JSON.stringify(newWorkspaces));
    localStorage.setItem('focus_dashboard_active_workspace', newActiveId);
  };

  const getActiveWorkspace = () => {
    return workspaces.find(ws => ws.id === activeWorkspaceId) || workspaces[0];
  };

  const updateActiveWorkspace = (updatedFields) => {
    const updatedWorkspaces = workspaces.map(ws => {
      if (ws.id === activeWorkspaceId) {
        return { ...ws, ...updatedFields };
      }
      return ws;
    });
    saveAllWorkspaces(updatedWorkspaces, activeWorkspaceId);
  };

  const addWidget = (typeKey) => {
    const widgetDef = WIDGET_TYPES[typeKey];
    const newId = `${typeKey.toLowerCase()}-${Date.now()}`;
    const newWidget = { i: newId, type: typeKey };
    
    // Only Spotify is global now
    if (typeKey === 'SPOTIFY') {
      const newGlobals = [...globalWidgets, newWidget];
      setGlobalWidgets(newGlobals);
      localStorage.setItem('focus_dashboard_global_widgets', JSON.stringify(newGlobals));
      setIsModalOpen(false);
      return;
    }

    const newLayoutItem = { i: newId, x: 0, y: 0, w: widgetDef.defaultW, h: widgetDef.defaultH };
    
    const activeWs = getActiveWorkspace();
    const newWidgets = [...activeWs.widgets, newWidget];
    const newLayouts = { ...activeWs.layouts };
    
    Object.keys(newLayouts).forEach(bp => {
      newLayouts[bp] = [...(newLayouts[bp] || []), newLayoutItem];
    });

    updateActiveWorkspace({ widgets: newWidgets, layouts: newLayouts });
    setIsModalOpen(false);
  };

  const removeGlobalWidget = (id) => {
    const newGlobals = globalWidgets.filter(w => w.i !== id);
    setGlobalWidgets(newGlobals);
    localStorage.setItem('focus_dashboard_global_widgets', JSON.stringify(newGlobals));
  };

  const removeWidget = (id) => {
    const activeWs = getActiveWorkspace();
    const newWidgets = activeWs.widgets.filter(w => w.i !== id);
    const newLayouts = { ...activeWs.layouts };
    Object.keys(newLayouts).forEach(bp => {
      newLayouts[bp] = newLayouts[bp].filter(l => l.i !== id);
    });
    updateActiveWorkspace({ widgets: newWidgets, layouts: newLayouts });
  };

  const moveWidget = (widgetId, targetWsId) => {
    if (activeWorkspaceId === targetWsId) return;

    const activeWs = getActiveWorkspace();
    const targetWs = workspaces.find(w => w.id === targetWsId);
    if (!targetWs) return;

    // Find the widget and its layouts
    const widgetToMove = activeWs.widgets.find(w => w.i === widgetId);
    if (!widgetToMove) return;

    // Remove from active
    const newActiveWidgets = activeWs.widgets.filter(w => w.i !== widgetId);
    const newActiveLayouts = { ...activeWs.layouts };
    Object.keys(newActiveLayouts).forEach(bp => {
      newActiveLayouts[bp] = newActiveLayouts[bp].filter(l => l.i !== widgetId);
    });

    // Add to target
    const newTargetWidgets = [...targetWs.widgets, widgetToMove];
    const newTargetLayouts = { ...targetWs.layouts };
    Object.keys(newTargetLayouts).forEach(bp => {
      const activeLayoutItem = activeWs.layouts[bp]?.find(l => l.i === widgetId);
      if (activeLayoutItem) {
        // Find safe y position at bottom of target
        const maxY = Math.max(0, ...(newTargetLayouts[bp] || []).map(l => l.y + l.h));
        newTargetLayouts[bp] = [...(newTargetLayouts[bp] || []), { ...activeLayoutItem, y: maxY }];
      }
    });

    const updatedWorkspaces = workspaces.map(ws => {
      if (ws.id === activeWorkspaceId) {
        return { ...ws, widgets: newActiveWidgets, layouts: newActiveLayouts };
      }
      if (ws.id === targetWsId) {
        return { ...ws, widgets: newTargetWidgets, layouts: newTargetLayouts };
      }
      return ws;
    });

    saveAllWorkspaces(updatedWorkspaces, activeWorkspaceId);
  };

  const handleLayoutChange = (layout, allLayouts) => {
    updateActiveWorkspace({ layouts: allLayouts });
  };

  const createNewWorkspace = () => {
    const name = prompt('Enter a name for the new workspace:');
    if (!name || !name.trim()) return;
    
    const newId = `ws-${Date.now()}`;
    const newWs = { id: newId, name: name.trim(), widgets: [], layouts: { lg: [] } };
    const newWorkspaces = [...workspaces, newWs];
    saveAllWorkspaces(newWorkspaces, newId);
  };

  const deleteWorkspace = (idToDelete) => {
    if (workspaces.length === 1) {
      alert("You cannot delete your only workspace!");
      return;
    }
    const confirmDelete = window.confirm("Are you sure you want to delete this workspace?");
    if (!confirmDelete) return;

    const newWorkspaces = workspaces.filter(ws => ws.id !== idToDelete);
    const newActiveId = activeWorkspaceId === idToDelete ? newWorkspaces[0].id : activeWorkspaceId;
    saveAllWorkspaces(newWorkspaces, newActiveId);
  };

  const [isLinksOpen, setIsLinksOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const THEMES = [
    { name: 'Default Purple', color: '#a78bfa' },
    { name: 'Cyberpunk Pink', color: '#ff00c1' },
    { name: 'Hacker Green', color: '#00ff00' },
    { name: 'Ocean Cyan', color: '#00d0ff' },
    { name: 'Sunset Orange', color: '#ff5e00' },
  ];

  const changeTheme = (color) => {
    document.documentElement.style.setProperty('--accent-color', color);
    localStorage.setItem('focus_theme_color', color);
    setIsThemeOpen(false);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('focus_theme_color');
    if (savedTheme) {
      document.documentElement.style.setProperty('--accent-color', savedTheme);
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.links-dropdown')) {
        setIsLinksOpen(false);
      }
      if (!e.target.closest('.theme-dropdown')) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!mounted) return null;

  const activeWs = getActiveWorkspace();

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      
      <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, position: 'relative' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(to right, #60a5fa, var(--accent-color, #a78bfa))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Focus
            </h1>
            <p style={{ margin: 0, fontSize: '1.1rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Created by HattyHats</p>
          </div>
          
          {/* Global Widgets Area */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '1rem', padding: '0 2rem' }}>
            {globalWidgets.map(widget => {
              const WidgetDef = WIDGET_TYPES[widget.type];
              if (!WidgetDef) return null;
              const WidgetComponent = WidgetDef.component;
              return (
                <div key={widget.i} style={{ height: 'max-content', minWidth: '300px', display: 'flex' }} className="glass-panel">
                  <WidgetComponent id={widget.i} onRemove={() => removeGlobalWidget(widget.i)} isGlobal={true} />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Theme Dropdown */}
            <div style={{ position: 'relative' }} className="theme-dropdown">
              <button 
                className="glass-panel" 
                onClick={(e) => { e.stopPropagation(); setIsThemeOpen(!isThemeOpen); setIsLinksOpen(false); }}
                style={{ 
                  height: '48px', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  borderRadius: '24px', color: 'var(--text-primary)', cursor: 'pointer'
                }}
                title="Change Theme"
              >
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-color)' }} />
              </button>
              {isThemeOpen && (
                <div style={{ 
                  position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '160px',
                  background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)',
                  border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.5rem',
                  display: 'flex', flexDirection: 'column', gap: '0.25rem', zIndex: 100
                }}>
                  {THEMES.map(theme => (
                    <button 
                      key={theme.name}
                      onClick={() => changeTheme(theme.color)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', 
                        color: 'var(--text-primary)', background: 'transparent', border: 'none',
                        borderRadius: '8px', cursor: 'pointer', textAlign: 'left'
                      }}
                      onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} 
                      onMouseOut={e=>e.currentTarget.style.background='transparent'}
                    >
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.color }} />
                      {theme.name}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid var(--glass-border)', margin: '0.25rem 0' }} />
                  <div style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="color" 
                      onChange={(e) => changeTheme(e.target.value)}
                      style={{ width: '24px', height: '24px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                      title="Custom Color"
                    />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Custom</span>
                  </div>
                </div>
              )}
            </div>

            {/* Links Dropdown */}
            <div style={{ position: 'relative' }} className="links-dropdown">
              <button 
                className="glass-panel" 
                onClick={(e) => { e.stopPropagation(); setIsLinksOpen(!isLinksOpen); }}
                style={{ 
                  height: '48px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  borderRadius: '24px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'
                }}
                title="Quick Links"
              >
                Links
              </button>
              {isLinksOpen && (
                <div style={{ 
                  position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '200px',
                  background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)',
                  border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.5rem',
                  display: 'flex', flexDirection: 'column', gap: '0.25rem', zIndex: 100
                }}>
                  <a href="https://earnwithhatty.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '0.75rem 1rem', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>Earn With Hatty</a>
                  <a href="https://hatsquickpad.netlify.app/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '0.75rem 1rem', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>Quick-Pad</a>
                  <a href="https://hattyhats.github.io/local-cast/" target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '0.75rem 1rem', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>Local-Cast</a>
                </div>
              )}
            </div>
            <button 
              className="glass-panel" 
              onClick={() => setIsModalOpen(true)}
              style={{ 
                width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', color: 'var(--accent-color)', flexShrink: 0, padding: 0
              }}
              title="Add Gadget to Workspace"
            >
              <Plus size={24} />
            </button>
          </div>
        </header>

      {/* Tabs UI */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', marginBottom: '1.5rem', overflowX: 'auto', flexShrink: 0, paddingBottom: '0.5rem' }}>
        {workspaces.map(ws => (
          <div 
            key={ws.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
              background: activeWorkspaceId === ws.id ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
              color: activeWorkspaceId === ws.id ? '#fff' : 'var(--text-primary)',
              border: '1px solid',
              borderColor: activeWorkspaceId === ws.id ? 'var(--accent-color)' : 'var(--glass-border)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setActiveWorkspaceId(ws.id)}
          >
            <span style={{ fontWeight: activeWorkspaceId === ws.id ? 600 : 400 }}>{ws.name}</span>
            {activeWorkspaceId === ws.id && workspaces.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); deleteWorkspace(ws.id); }}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', padding: 0, display: 'flex', cursor: 'pointer' }}
                title="Delete Workspace"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        <button 
          onClick={createNewWorkspace}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
            borderRadius: '8px', background: 'transparent', border: '1px dashed var(--text-secondary)',
            color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap'
          }}
        >
          <FolderPlus size={16} /> New Tab
        </button>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '2rem' }}>
        {/* We use key={activeWs.id} to force a complete re-mount of the grid when switching tabs. 
            This prevents react-grid-layout animation glitches when layouts change completely. */}
        <DashboardGrid 
          key={activeWs.id}
          widgets={activeWs.widgets}
          layouts={activeWs.layouts}
          onLayoutChange={handleLayoutChange}
          onRemove={removeWidget}
          workspaces={workspaces.filter(w => w.id !== activeWs.id)}
          onMove={moveWidget}
        />
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ width: '400px', maxWidth: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="glass-panel-header" style={{ cursor: 'default' }}>
              <h3 style={{ margin: 0 }}>Add Widget to {activeWs.name}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            <div className="glass-panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {AVAILABLE_WIDGETS.map(w => (
                <button 
                  key={w.id} 
                  onClick={() => addWidget(w.id)}
                  style={{
                    padding: '1rem', textAlign: 'left', background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px', border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '1rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <Plus size={18} color="var(--accent-color)" />
                  {w.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
    </>
  );
}
