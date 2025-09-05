import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SimpleNeonCard = ({ children, className = "" }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      <style>{`
        @keyframes light-rail {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .neon-border {
          border: 2px solid #00ffff;
          box-shadow: 
            0 0 5px #00ffff,
            0 0 10px #00ffff,
            0 0 15px #00ffff;
        }

        .neon-rail {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            #00ffff 25%, 
            #ffffff 50%, 
            #00ffff 75%, 
            transparent 100%
          );
          background-size: 200% 100%;
          animation: light-rail 1.5s linear infinite;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
        }
      `}</style>

      <motion.div
        drag
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        whileHover={{ scale: 1.02 }}
        whileDrag={{ scale: 1.05 }}
        className={`
          relative
          p-6
          rounded-lg
          bg-black/40
          backdrop-blur-sm
          cursor-grab
          active:cursor-grabbing
          transition-all
          duration-300
          ${isDragging ? 'neon-border' : 'border-2 border-cyan-400/50'}
          ${className}
        `}
      >
        {isDragging && <div className="neon-rail" />}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    </>
  );
};

export default SimpleNeonCard;