import React, { useState } from 'react';
import { motion } from 'framer-motion';

const NeonDraggableCard = ({ 
  children, 
  className = "", 
  neonColor = "cyan",
  ...props 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Neon color variants
  const neonColors = {
    cyan: {
      static: 'border-cyan-400 shadow-cyan-400/50',
      glow: 'shadow-cyan-400/75',
      rail: 'neon-rail-cyan'
    },
    purple: {
      static: 'border-purple-400 shadow-purple-400/50',
      glow: 'shadow-purple-400/75',
      rail: 'neon-rail-purple'
    },
    pink: {
      static: 'border-pink-400 shadow-pink-400/50',
      glow: 'shadow-pink-400/75',
      rail: 'neon-rail-pink'
    },
    green: {
      static: 'border-green-400 shadow-green-400/50',
      glow: 'shadow-green-400/75',
      rail: 'neon-rail-green'
    },
    blue: {
      static: 'border-blue-400 shadow-blue-400/50',
      glow: 'shadow-blue-400/75',
      rail: 'neon-rail-blue'
    }
  };

  const colorScheme = neonColors[neonColor] || neonColors.cyan;

  return (
    <>
      {/* Custom CSS Styles */}
      <style>{`
        /* Base neon glow keyframes */
        @keyframes neon-pulse {
          0%, 100% {
            filter: brightness(1) saturate(1);
          }
          50% {
            filter: brightness(1.2) saturate(1.3);
          }
        }

        /* Light rail animation keyframes */
        @keyframes neon-rail-move {
          0% {
            background-position: 0% 0%;
          }
          25% {
            background-position: 100% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }

        /* Neon rail effect classes */
        .neon-rail-cyan {
          background: linear-gradient(90deg, 
            transparent 0%, 
            transparent 30%, 
            #00ffff 50%, 
            transparent 70%, 
            transparent 100%
          );
          background-size: 200% 200%;
          animation: neon-rail-move 2s linear infinite;
        }

        .neon-rail-purple {
          background: linear-gradient(90deg, 
            transparent 0%, 
            transparent 30%, 
            #a855f7 50%, 
            transparent 70%, 
            transparent 100%
          );
          background-size: 200% 200%;
          animation: neon-rail-move 2s linear infinite;
        }

        .neon-rail-pink {
          background: linear-gradient(90deg, 
            transparent 0%, 
            transparent 30%, 
            #f472b6 50%, 
            transparent 70%, 
            transparent 100%
          );
          background-size: 200% 200%;
          animation: neon-rail-move 2s linear infinite;
        }

        .neon-rail-green {
          background: linear-gradient(90deg, 
            transparent 0%, 
            transparent 30%, 
            #4ade80 50%, 
            transparent 70%, 
            transparent 100%
          );
          background-size: 200% 200%;
          animation: neon-rail-move 2s linear infinite;
        }

        .neon-rail-blue {
          background: linear-gradient(90deg, 
            transparent 0%, 
            transparent 30%, 
            #60a5fa 50%, 
            transparent 70%, 
            transparent 100%
          );
          background-size: 200% 200%;
          animation: neon-rail-move 2s linear infinite;
        }

        /* Neon static glow */
        .neon-static {
          animation: neon-pulse 2s ease-in-out infinite;
        }

        /* Enhanced glow during drag */
        .neon-dragging {
          filter: brightness(1.3) saturate(1.4);
          animation: neon-pulse 0.5s ease-in-out infinite;
        }
      `}</style>

      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.02 }}
        whileDrag={{ scale: 1.05, rotate: 2 }}
        className={`
          relative
          cursor-grab
          active:cursor-grabbing
          select-none
          transition-all
          duration-300
          ${className}
        `}
        {...props}
      >
        {/* Main Card Content */}
        <div
          className={`
            relative
            p-6
            rounded-lg
            border-2
            backdrop-blur-sm
            bg-black/20
            transition-all
            duration-300
            ${isDragging 
              ? `${colorScheme.static} ${colorScheme.glow} neon-dragging shadow-2xl` 
              : `${colorScheme.static} shadow-lg neon-static`
            }
          `}
        >
          {/* Light Rail Effect Overlay */}
          {isDragging && (
            <div
              className={`
                absolute
                inset-0
                rounded-lg
                border-2
                border-transparent
                ${colorScheme.rail}
                pointer-events-none
                z-10
              `}
            />
          )}

          {/* Card Content */}
          <div className="relative z-20">
            {children}
          </div>

          {/* Additional Glow Layer */}
          {isDragging && (
            <div
              className={`
                absolute
                inset-0
                rounded-lg
                bg-gradient-to-r
                from-transparent
                via-white/5
                to-transparent
                pointer-events-none
                animate-pulse
              `}
            />
          )}
        </div>

        {/* Outer Glow Ring */}
        {isDragging && (
          <div
            className={`
              absolute
              inset-0
              rounded-lg
              border
              ${colorScheme.static}
              ${colorScheme.glow}
              scale-110
              opacity-30
              pointer-events-none
              animate-ping
            `}
          />
        )}
      </motion.div>
    </>
  );
};

// Demo component showcasing different neon colors
const NeonDraggableDemo = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8 flex flex-wrap gap-8 items-center justify-center">
      <NeonDraggableCard neonColor="cyan" className="w-64 h-48">
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Cyan Neon</h3>
          <p className="text-foreground/70">Drag me to see the light rail!</p>
          <div className="mt-4 w-full h-2 bg-cyan-400/20 rounded-full">
            <div className="w-3/4 h-full bg-cyan-400 rounded-full"></div>
          </div>
        </div>
      </NeonDraggableCard>

      <NeonDraggableCard neonColor="purple" className="w-64 h-48">
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Purple Neon</h3>
          <p className="text-foreground/70">Futuristic glow effect</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-full h-8 bg-purple-400/20 rounded"></div>
            ))}
          </div>
        </div>
      </NeonDraggableCard>

      <NeonDraggableCard neonColor="pink" className="w-64 h-48">
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Pink Neon</h3>
          <p className="text-foreground/70">Smooth rail animation</p>
          <div className="mt-4 flex justify-center space-x-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-3 h-3 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.2}s`}}></div>
            ))}
          </div>
        </div>
      </NeonDraggableCard>

      <NeonDraggableCard neonColor="green" className="w-64 h-48">
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Green Neon</h3>
          <p className="text-foreground/70">Eco-friendly glow</p>
          <div className="mt-4">
            <div className="w-full bg-green-400/20 rounded-full h-4 mb-2">
              <div className="bg-green-400 h-4 rounded-full w-5/6"></div>
            </div>
            <p className="text-green-400 text-sm">83% Complete</p>
          </div>
        </div>
      </NeonDraggableCard>

      <NeonDraggableCard neonColor="blue" className="w-64 h-48">
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Blue Neon</h3>
          <p className="text-foreground/70">Ocean wave effect</p>
          <div className="mt-4 space-y-2">
            <div className="flex space-x-1">
              {Array.from({length: 8}).map((_, i) => (
                <div 
                  key={i} 
                  className="w-6 h-8 bg-blue-400/30 rounded animate-pulse"
                  style={{animationDelay: `${i * 0.1}s`}}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </NeonDraggableCard>

      {/* Instructions */}
      <div className="w-full text-center mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Neon Draggable Cards</h2>
        <p className="text-foreground/80 mb-2">Click and drag any card to activate the neon light rail effect</p>
        <p className="text-foreground/50 text-sm">Built with React, Framer Motion, and TailwindCSS</p>
      </div>
    </div>
  );
};

export default NeonDraggableCard;
export { NeonDraggableDemo };