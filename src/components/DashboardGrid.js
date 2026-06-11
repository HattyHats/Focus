'use client';
import { useRef, useState, useEffect } from 'react';
import { Responsive } from 'react-grid-layout';
import { WIDGET_TYPES } from './WidgetRegistry';

function WidthProvider(WrappedComponent) {
  return function WidthProviderWrapper(props) {
    const [width, setWidth] = useState(1200);
    const containerRef = useRef(null);

    useEffect(() => {
      if (!containerRef.current) return;
      setWidth(containerRef.current.offsetWidth);
      
      const resizeObserver = new ResizeObserver((entries) => {
        setWidth(entries[0].contentRect.width);
      });
      
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }, []);

    return (
      <div ref={containerRef} style={{ width: '100%' }}>
        <WrappedComponent {...props} width={width} />
      </div>
    );
  };
}

const ResponsiveGridLayout = WidthProvider(Responsive);

export default function DashboardGrid({ widgets, layouts, onLayoutChange, onRemove, workspaces = [], onMove }) {
  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={100}
      onLayoutChange={onLayoutChange}
      draggableHandle=".glass-panel-header"
      margin={[20, 20]}
    >
      {widgets.map(widget => {
        const WidgetDef = WIDGET_TYPES[widget.type];
        if (!WidgetDef) return null;
        
        const WidgetComponent = WidgetDef.component;

        return (
          <div key={widget.i} className="glass-panel">
            <WidgetComponent 
              id={widget.i} 
              onRemove={() => onRemove(widget.i)} 
              workspaces={workspaces}
              onMove={(targetWsId) => onMove && onMove(widget.i, targetWsId)}
              {...(WidgetDef.props || {})}
            />
          </div>
        );
      })}
    </ResponsiveGridLayout>
  );
}
