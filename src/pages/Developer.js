import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Code, 
  Terminal,
  Cpu,
  Database,
  Globe
} from 'lucide-react';

const Developer = () => {
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();
  
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
  
  useEffect(() => {
    // Set timer to show message after 3 seconds
    const timer = setTimeout(() => {
      setShowMessage(true);
      
      // Navigate to home page after showing message for 2 seconds
      const navigateTimer = setTimeout(() => {
        navigate('/');
      }, 2000);
      
      return () => clearTimeout(navigateTimer);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const developerInfo = {
    name: "Akash",
    role: "App developer AI/ML",
    bio: "Passionate developer with expertise in creating modern web applications. Focused on building intuitive user experiences with cutting-edge technologies. Always eager to learn new skills and tackle challenging problems.",
    email: "kotariakash2005@gmail.com",
    github: "https://github.com/AkashKotari",
    linkedin: "https://linkedin.com/in/akash-kotari-b4775b256"
  };

  const skills = [
    {
      name: "Frontend",
      icon: <Globe className="w-5 h-5 text-akash-400" />,
      items: ["React", "JavaScript", "HTML/CSS", "Tailwind CSS", "Framer Motion"]
    },
    {
      name: "Backend",
      icon: <Terminal className="w-5 h-5 text-akash-400" />,
      items: ["Node.js", "Express", "MongoDB", "REST APIs", "WebSocket"]
    },
    {
      name: "Tools",
      icon: <Cpu className="w-5 h-5 text-akash-400" />,
      items: ["Git", "VS Code", "Postman", "MongoDB Atlas", "Electron"]
    },
    {
      name: "Concepts",
      icon: <Database className="w-5 h-5 text-akash-400" />,
      items: ["UI/UX Design", "Responsive Design", "State Management", "Authentication", "File Transfer"]
    }
  ];

  return (
    <div className="min-h-screen px-4 py-12 bg-background sm:px-6">
      {showMessage ? (
        // Show message after 3 seconds
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.h1 
              className="mb-6 text-4xl font-bold text-white md:text-5xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Enjoy <span className="text-akash-400">Akash Share</span>
            </motion.h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-0.5 bg-gradient-to-r from-transparent via-akash-400 to-transparent mx-auto"
            />
          </motion.div>
        </div>
      ) : (
        // Show developer content
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Meet the <span className="text-akash-400">Developer</span>
            </h1>
            <p className="max-w-2xl mx-auto text-white/70">
              The creative mind behind Akash Share - a passionate developer dedicated to building 
              seamless file sharing experiences.
            </p>
          </motion.div>

          {/* Developer Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl p-8 mx-auto mb-12 border rounded-lg bg-card border-border"
          >
            <div className="flex flex-col items-center p-8 space-y-8 md:flex-row md:space-y-0 md:space-x-12">
              {/* Developer Image with glowing effect */}
              <div className="relative developer-profile-frame">
                <div className="relative z-10 w-40 h-40 overflow-hidden border-4 rounded-full shadow-2xl border-akash-400/30 shadow-akash-400/20">
                  <img 
                    src={getAssetPath('/Akashshareicon-backup.png')} 
                    alt="Akash" 
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      console.error('Failed to load developer image:', e);
                      // Fallback to initials if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="flex items-center justify-center hidden w-full h-full text-4xl font-bold text-white bg-gradient-to-br from-akash-400 to-purple-500">
                    {developerInfo.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="absolute z-20 flex items-center justify-center w-12 h-12 border-4 rounded-full -bottom-2 -right-2 bg-akash-400 border-slate-900">
                  <Code className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Developer Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="mb-2 text-3xl font-bold text-white">{developerInfo.name}</h2>
                <p className="mb-3 text-lg font-medium text-akash-400">{developerInfo.role}</p>
                <p className="mb-6 leading-relaxed text-white/80">{developerInfo.bio}</p>
                
                <div className="flex justify-center space-x-4 md:justify-start">
                  <motion.a
                    href={developerInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center p-3 transition-all duration-300 rounded-full bg-white/10 hover:bg-akash-400/20"
                  >
                    <Github className="w-5 h-5 text-white" />
                  </motion.a>
                  <motion.a
                    href={developerInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center p-3 transition-all duration-300 rounded-full bg-white/10 hover:bg-akash-400/20"
                  >
                    <Linkedin className="w-5 h-5 text-white" />
                  </motion.a>
                  <motion.a
                    href={`mailto:${developerInfo.email}`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center p-3 transition-all duration-300 rounded-full bg-white/10 hover:bg-akash-400/20"
                  >
                    <Mail className="w-5 h-5 text-white" />
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl p-8 mx-auto glass-card"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(59, 130, 246, 0.1)',
              borderRadius: '1rem',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <h2 className="mb-8 text-2xl font-bold text-center text-white">Technical Skills</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-6 transition-all duration-300 border rounded-lg bg-card border-border hover:border-akash-400/30"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-2 mr-3 rounded-lg bg-akash-400/20">
                      {skill.icon}
                    </div>
                    <h3 className="font-semibold text-akash-400">{skill.name}</h3>
                  </div>
                  <ul className="space-y-2">
                    {skill.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-akash-400 mr-2"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Developer;