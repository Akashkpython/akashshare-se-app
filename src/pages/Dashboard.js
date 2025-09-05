import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  Download, 
  History, 
  Settings, 
  FileText, 
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Users,
  HardDrive
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useStore from '../store/useStore';
import { formatFileSize, getFileIcon } from '../lib/utils';

// Custom colored versions of the original Lucide icons with colored backgrounds and white symbols
const ColoredUploadIcon = () => (
  <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center">
    <Upload className="w-8 h-8 text-white" />
  </div>
);

const ColoredDownloadIcon = () => (
  <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center">
    <Download className="w-8 h-8 text-white" />
  </div>
);

const ColoredHistoryIcon = () => (
  <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center">
    <History className="w-8 h-8 text-white" />
  </div>
);

const ColoredSettingsIcon = () => (
  <div className="w-16 h-16 rounded-2xl bg-purple-500 flex items-center justify-center">
    <Settings className="w-8 h-8 text-white" />
  </div>
);

const Dashboard = () => {
  const { transferHistory } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for charts
  const transferData = [
    { name: 'Mon', uploads: 12, downloads: 8 },
    { name: 'Tue', uploads: 19, downloads: 15 },
    { name: 'Wed', uploads: 8, downloads: 12 },
    { name: 'Thu', uploads: 15, downloads: 10 },
    { name: 'Fri', uploads: 22, downloads: 18 },
    { name: 'Sat', uploads: 10, downloads: 7 },
    { name: 'Sun', uploads: 14, downloads: 11 },
  ];

  const fileTypeData = [
    { name: 'Images', value: 35, color: '#3B82F6' },
    { name: 'Documents', value: 25, color: '#10B981' },
    { name: 'Videos', value: 20, color: '#F59E0B' },
    { name: 'Audio', value: 15, color: '#EF4444' },
    { name: 'Other', value: 5, color: '#8B5CF6' },
  ];

  const quickActions = [
    {
      title: 'Send Files',
      description: 'Upload and share files',
      icon: ColoredUploadIcon,
      path: '/send',
      color: 'from-blue-500 to-purple-600',
      gradient: 'from-blue-400 to-purple-500'
    },
    {
      title: 'Receive Files',
      description: 'Download with share code',
      icon: ColoredDownloadIcon,
      path: '/receive',
      color: 'from-green-500 to-emerald-600',
      gradient: 'from-green-400 to-emerald-500'
    },
    {
      title: 'View History',
      description: 'Check transfer records',
      icon: ColoredHistoryIcon,
      path: '/history',
      color: 'from-orange-500 to-red-600',
      gradient: 'from-orange-400 to-red-500'
    },
    {
      title: 'Settings',
      description: 'Configure preferences',
      icon: ColoredSettingsIcon,
      path: '/settings',
      color: 'from-purple-500 to-pink-600',
      gradient: 'from-purple-400 to-pink-500'
    }
  ];

  const stats = [
    {
      title: 'Total Transfers',
      value: transferHistory.length,
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Active Codes',
      value: 12,
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Storage Used',
      value: '2.4 GB',
      icon: HardDrive,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Success Rate',
      value: '98.5%',
      icon: Shield,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Instant file sharing with optimized transfer speeds'
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'End-to-end encryption and secure share codes'
    },
    {
      icon: Clock,
      title: '24/7 Available',
      description: 'Access your files anytime, anywhere'
    }
  ];

  const recentTransfers = transferHistory.slice(-5).reverse();

  useEffect(() => {
    // Simulate data loading with a more realistic delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center mb-8">
          <div className="h-12 bg-foreground/10 rounded-xl animate-pulse mx-auto mb-4 w-3/4"></div>
          <div className="h-6 bg-foreground/10 rounded-lg animate-pulse mx-auto w-1/2"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-foreground/10 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-foreground/10 rounded-2xl animate-pulse"></div>
          <div className="h-80 bg-foreground/10 rounded-2xl animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-foreground/10 rounded-2xl animate-pulse"></div>
          <div className="h-64 bg-foreground/10 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative"
      >
        {/* Neon text with moving light effect */}
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 neon-text-light-effect" data-text="Welcome to Akash Share">
            Welcome to Akash Share
          </h1>
        </div>
        
        <p className="text-foreground/70 text-lg md:text-xl relative z-10">
          Next-generation file sharing made simple and secure
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          // Special handling for the first card (Send Files)
          const isSendFiles = index === 0;
          
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={isSendFiles ? { scale: 1.02 } : { scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={isSendFiles ? "transition-transform duration-300 ease-in-out" : ""}
            >
              <Link to={action.path}>
                <div className={`floating-card p-6 text-center group cursor-pointer`}
                  style={{
                    background: 'linear-gradient(180deg, #000000 0%, #121212 50%, #1C1C1C 100%)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(59, 130, 246, 0.1)',
                    borderRadius: '1rem',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  }}>
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                    <Icon />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-gray-300 text-sm">{action.description}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass-card-enhanced p-6 animate-float"
              style={{
                background: 'linear-gradient(180deg, #000000 0%, #121212 50%, #1C1C1C 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(59, 130, 246, 0.1)',
                borderRadius: '1rem',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-white`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Transfer Activity Chart */}
        <div className="glass-card-enhanced p-6 animate-float"
          style={{
            background: 'linear-gradient(180deg, #000000 0%, #121212 50%, #1C1C1C 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
          <h3 className="text-lg font-semibold text-white mb-4">Transfer Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transferData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground) / 0.6)" />
              <YAxis stroke="hsl(var(--foreground) / 0.6)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background) / 0.8)', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px'
                }}
              />
              <Bar dataKey="uploads" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="downloads" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* File Types Chart */}
        <div className="glass-card-enhanced p-6 animate-float"
          style={{
            background: 'linear-gradient(180deg, #000000 0%, #121212 50%, #1C1C1C 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
          <h3 className="text-lg font-semibold text-white mb-4">File Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fileTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {fileTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background) / 0.8)', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Transfers & Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Recent Transfers */}
        <div className="glass-card-enhanced p-6 animate-float"
          style={{
            background: 'linear-gradient(180deg, #000000 0%, #121212 50%, #1C1C1C 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
          <h3 className="text-lg font-semibold text-white mb-4">Recent Transfers</h3>
          <div className="space-y-3">
            {recentTransfers.length > 0 ? (
              recentTransfers.map((transfer, index) => (
                <motion.div
                  key={transfer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  <div className="text-2xl">{getFileIcon(transfer.fileType || 'default')}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{transfer.fileName}</p>
                    <p className="text-gray-400 text-sm">{formatFileSize(transfer.fileSize)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">{new Date(transfer.startTime).toLocaleDateString()}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      transfer.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {transfer.status}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400">No transfers yet</p>
                <p className="text-gray-500 text-sm">Start sharing files to see them here</p>
              </div>
            )}
          </div>
        </div>

        {/* Why Choose Akash Share? */}
        <div className="glass-card-enhanced p-6 animate-float"
          style={{
            background: 'linear-gradient(180deg, #000000 0%, #121212 50%, #1C1C1C 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
          <h3 className="text-lg font-semibold text-white mb-4">Why Choose Akash Share?</h3>
          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-akash-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-akash-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{feature.title}</h4>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;