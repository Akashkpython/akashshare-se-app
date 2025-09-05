import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

const SaReGaMaPa = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Function to get the correct path for static assets in Electron
  const getAssetPath = (assetPath) => {
    // In Electron, we need to use the proper path for static assets
    if (window.location.protocol === 'file:') {
      // In Electron production build, we need to adjust the path
      // Remove leading slash and add ./ prefix
      const cleanPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
      return `./${cleanPath}`;
    }
    // In development or web deployment
    return assetPath;
  };

  // Play audio function
  const playAudio = async () => {
    if (audioRef.current) {
      try {
        // Set properties for continuous playback
        audioRef.current.loop = true;
        audioRef.current.volume = 0.7;
        audioRef.current.muted = false;
        
        // Attempt to play the audio
        await audioRef.current.play();
        setIsPlaying(true);
        setIsMuted(false);
        console.log('Background music started playing');
      } catch (error) {
        console.log('Autoplay blocked, user interaction needed:', error);
        setIsPlaying(false);
      }
    }
  };

  // Toggle mute function
  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !audioRef.current.muted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // If unmuting and not playing, try to play
      if (!newMutedState && !isPlaying) {
        playAudio();
      }
    }
  };

  useEffect(() => {
    // Play audio when component mounts
    playAudio();

    // Handle user interaction to enable audio playback
    const handleUserInteraction = () => {
      if (audioRef.current) {
        audioRef.current.muted = false;
        audioRef.current.volume = 0.7;
        playAudio();
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    // Cleanup audio on unmount
    return () => {
      // Remove event listeners
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      
      // Pause audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="p-6 h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center"
      >
        <div className="text-center max-w-md">
          {/* Akashshareicon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-6"
          >
            <img 
              src={getAssetPath('/Akashshareicon.png')} 
              alt="Akash Share Logo" 
              className="w-24 h-24 object-contain rounded-full mx-auto"
            />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-foreground mb-4"
          >
            Sa Re Ga Ma Pa
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-foreground/70 text-lg mb-2"
          >
            Coming Soon
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-foreground/50 text-sm"
          >
            Get ready for an exciting musical experience!
          </motion.p>
          
          {/* Audio control button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className="mt-6 p-3 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
            aria-label={isMuted ? "Unmute music" : "Mute music"}
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-foreground" />
            ) : (
              <Volume2 className="w-6 h-6 text-foreground" />
            )}
          </motion.button>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-foreground/70 text-sm mt-4"
          >
            {isMuted ? "Music is muted" : "Background music playing"}
          </motion.p>
        </div>
      </motion.div>
      
      {/* Hidden audio element that plays automatically in loop */}
      <audio 
        ref={audioRef} 
        src={getAssetPath('/music1.mp3')}
        onError={(e) => {
          console.error('Audio error:', e);
        }}
      />
    </div>
  );
};

export default SaReGaMaPa;