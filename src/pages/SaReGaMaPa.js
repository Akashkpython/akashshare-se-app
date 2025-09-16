import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

const SaReGaMaPa = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

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
  const playAudio = useCallback(async () => {
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
        return true;
      } catch (error) {
        console.log('Autoplay blocked, user interaction needed:', error);
        setIsPlaying(false);
        return false;
      }
    }
    return false;
  }, []);

  // Toggle mute function
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMutedState = !audioRef.current.muted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // If unmuting and not playing, try to play
      if (!newMutedState && !isPlaying) {
        playAudio();
      }
    }
  }, [isPlaying, playAudio]);

  // Handle user interaction
  const handleUserInteraction = useCallback(async () => {
    if (!userInteracted && audioRef.current) {
      setUserInteracted(true);
      audioRef.current.muted = false;
      audioRef.current.volume = 0.7;
      const success = await playAudio();
      
      // Remove event listeners after successful play
      if (success) {
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
      }
    }
  }, [userInteracted, playAudio]);

  useEffect(() => {
    // Try to play audio when component mounts (might work in some browsers)
    playAudio();

    // Add event listeners for user interaction to enable audio playback
    // These are required due to browser autoplay policies
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

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
  }, [playAudio, handleUserInteraction]); // Added playAudio to dependency array

  return (
    <div className="flex flex-col h-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center flex-1"
      >
        <div className="max-w-md text-center">
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
              className="object-contain w-24 h-24 mx-auto rounded-full"
            />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 text-3xl font-bold text-foreground"
          >
            Sa Re Ga Ma Pa
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-2 text-lg text-foreground/70"
          >
            Coming Soon
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-foreground/50"
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
            className="p-3 mt-6 transition-colors rounded-full bg-foreground/10 hover:bg-foreground/20"
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
            className="mt-4 text-sm text-foreground/70"
          >
            {isMuted ? "Music is muted" : "Background music playing"}
          </motion.p>
          
          {/* Prompt user to interact if audio is not playing */}
          {!isPlaying && !userInteracted && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 text-sm italic text-foreground/70"
            >
              Click anywhere to start background music
            </motion.p>
          )}
        </div>
      </motion.div>
      
      {/* Hidden audio element that plays automatically in loop */}
      <audio 
        ref={audioRef} 
        src={getAssetPath('/Sri Krishna.mp3.mp3')}
        autoPlay
        loop
        preload="auto"
        onError={(e) => {
          console.error('Audio error:', e);
        }}
        onPlay={() => {
          console.log('Audio is now playing');
          setIsPlaying(true);
        }}
        onPause={() => {
          console.log('Audio is now paused');
          setIsPlaying(false);
        }}
      />
    </div>
  );
};

export default SaReGaMaPa;