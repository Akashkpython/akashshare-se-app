import React, { useEffect, useRef, useState, useCallback } from 'react';

// Ultra-Minimal Modern Neon Effect - Only Border Glow and Tiny Mouse Trails
export const NeonDragEffect = ({ children, neonColor = '#00f5ff', intensity = 0.4 }) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [neonTrail, setNeonTrail] = useState([]);
  const trailRef = useRef([]);
  const animationRef = useRef();

  const updateTrail = useCallback(() => {
    const now = Date.now();
    trailRef.current = trailRef.current
      .map(point => ({
        ...point,
        age: (now - point.timestamp) / 1000,
        opacity: Math.max(0, 1 - (now - point.timestamp) / 600), // Faster fade
      }))
      .filter(point => point.opacity > 0.08);
    
    setNeonTrail([...trailRef.current]);
    
    if (trailRef.current.length > 0 || isDragging) {
      animationRef.current = requestAnimationFrame(updateTrail);
    }
  }, [isDragging]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Only add point if mouse moved enough (reduces trail density)
      const lastPoint = trailRef.current[trailRef.current.length - 1];
      if (!lastPoint || Math.abs(lastPoint.x - x) > 5 || Math.abs(lastPoint.y - y) > 5) {
        const newPoint = {
          id: Date.now() + Math.random(),
          x,
          y,
          timestamp: Date.now(),
          opacity: 1,
          age: 0,
        };
        
        trailRef.current.push(newPoint);
        
        // Reduce max trail length for cleaner look
        if (trailRef.current.length > 15) {
          trailRef.current = trailRef.current.slice(-15);
        }
      }
    };

    const handleMouseDown = (e) => {
      if (e.button === 0) {
        setIsDragging(true);
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        trailRef.current = [{
          id: Date.now(),
          x,
          y,
          timestamp: Date.now(),
          opacity: 1,
          age: 0,
        }];
        
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        animationRef.current = requestAnimationFrame(updateTrail);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging, updateTrail]);

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ 
        isolation: 'isolate',
        userSelect: 'none',
        // Ultra-subtle border neon glow - barely visible but elegant
        border: `1px solid rgba(0, 245, 255, 0.1)`,
        borderRadius: '12px',
        boxShadow: `
          inset 0 0 30px rgba(0, 245, 255, 0.03),
          0 0 5px rgba(0, 245, 255, 0.08),
          0 0 15px rgba(0, 245, 255, 0.04)
        `,
        backdropFilter: 'blur(0.5px)',
      }}
    >
      {/* Ultra-Minimal Mouse Trail - Tiny Dots Only */}
      {neonTrail.map((point) => {
        const scale = Math.max(0.3, 1 - point.age * 2); // Faster scaling
        const size = 3; // Even smaller - just tiny dots
        
        return (
          <div
            key={point.id}
            className="absolute pointer-events-none"
            style={{
              left: point.x - size,
              top: point.y - size,
              width: size * 2,
              height: size * 2,
              transform: `scale(${scale})`,
              opacity: point.opacity * intensity,
            }}
          >
            {/* Single minimal neon dot - ultra clean */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${neonColor}, ${neonColor}80 50%, transparent 70%)`,
                boxShadow: `0 0 4px ${neonColor}80, 0 0 8px ${neonColor}40`,
                filter: 'blur(0.3px)',
              }}
            />
          </div>
        );
      })}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default NeonDragEffect;