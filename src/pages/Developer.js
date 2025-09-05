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
    role: "Full Stack Developer",
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
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
      {showMessage ? (
        // Show message after 3 seconds
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-white mb-6"
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
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Meet the <span className="text-akash-400">Developer</span>
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              The creative mind behind Akash Share - a passionate developer dedicated to building 
              seamless file sharing experiences.
            </p>
          </motion.div>

          {/* Developer Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card max-w-4xl mx-auto mb-12 rounded-lg border border-border p-8"
          >
            <div className="flex flex-col md:flex-row items-center p-8 space-y-8 md:space-y-0 md:space-x-12">
              {/* Developer Image with glowing effect */}
              <div className="relative developer-profile-frame">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-akash-400/30 shadow-2xl shadow-akash-400/20 relative z-10">
                  <img 
                    src={getAssetPath('/Akashshareicon-backup.png')} 
                    alt="Akash" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Failed to load developer image:', e);
                      // Fallback to initials if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-akash-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold hidden">
                    {developerInfo.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-akash-400 flex items-center justify-center border-4 border-slate-900 z-20">
                  <Code className="w-6 h-6 text-white" />
                </div>
              </div>
              
              {/* Developer Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">{developerInfo.name}</h2>
                <p className="text-akash-400 font-medium text-lg mb-3">{developerInfo.role}</p>
                <p className="text-white/80 mb-6 leading-relaxed">{developerInfo.bio}</p>
                
                <div className="flex justify-center md:justify-start space-x-4">
                  <motion.a
                    href={developerInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-full bg-white/10 hover:bg-akash-400/20 transition-all duration-300 flex items-center justify-center"
                  >
                    <Github className="w-5 h-5 text-white" />
                  </motion.a>
                  <motion.a
                    href={developerInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-full bg-white/10 hover:bg-akash-400/20 transition-all duration-300 flex items-center justify-center"
                  >
                    <Linkedin className="w-5 h-5 text-white" />
                  </motion.a>
                  <motion.a
                    href={`mailto:${developerInfo.email}`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-full bg-white/10 hover:bg-akash-400/20 transition-all duration-300 flex items-center justify-center"
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
            className="glass-card p-8 max-w-4xl mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
              backdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(59, 130, 246, 0.1)',
              borderRadius: '1rem',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <h2 className="text-2xl font-bold text-white text-center mb-8">Technical Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-card p-6 rounded-lg border border-border hover:border-akash-400/30 transition-all duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="p-2 rounded-lg bg-akash-400/20 mr-3">
                      {skill.icon}
                    </div>
                    <h3 className="text-akash-400 font-semibold">{skill.name}</h3>
                  </div>
                  <ul className="space-y-2">
                    {skill.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-white/70 text-sm flex items-center">
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