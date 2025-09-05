import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History as HistoryIcon, 
  Download, 
  Upload, 
  File, 
  Image, 
  Video, 
  Music, 
  Archive,
  Search,
  Trash2,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import useStore from '../store/useStore';
import { formatFileSize, formatDate } from '../lib/utils';

const History = () => {
  const { transferHistory, clearHistory, addNotification } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading with a more realistic delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort transfers
  const filteredTransfers = useMemo(() => {
    let filtered = transferHistory;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transfer =>
        transfer.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(transfer => transfer.direction === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(transfer => transfer.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.startTime) - new Date(a.startTime);
        case 'name':
          return (a.fileName || '').localeCompare(b.fileName || '');
        case 'size':
          return (b.fileSize || 0) - (a.fileSize || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [transferHistory, searchTerm, filterType, filterStatus, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = transferHistory.length;
    const uploads = transferHistory.filter(t => t.direction === 'upload').length;
    const downloads = transferHistory.filter(t => t.direction === 'download').length;
    const completed = transferHistory.filter(t => t.status === 'completed').length;
    const totalSize = transferHistory.reduce((sum, t) => sum + (t.fileSize || 0), 0);

    return { total, uploads, downloads, completed, totalSize };
  }, [transferHistory]);

  // Chart data
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTransfers = transferHistory.filter(t => 
        new Date(t.startTime).toISOString().split('T')[0] === date
      );
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        uploads: dayTransfers.filter(t => t.direction === 'upload').length,
        downloads: dayTransfers.filter(t => t.direction === 'download').length,
        total: dayTransfers.length
      };
    });
  }, [transferHistory]);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all transfer history? This action cannot be undone.')) {
      clearHistory();
      addNotification({
        type: 'success',
        title: 'History Cleared',
        message: 'All transfer history has been cleared'
      });
    }
  };

  const getFileIconComponent = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType?.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (fileType?.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (fileType?.includes('zip') || fileType?.includes('rar') || fileType?.includes('tar')) return <Archive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-10 bg-foreground/10 rounded-xl animate-pulse mb-4 w-1/3"></div>
            <div className="h-6 bg-foreground/10 rounded-lg animate-pulse w-1/2"></div>
          </div>
          <div className="h-10 w-32 bg-foreground/10 rounded-xl animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-foreground/10 rounded-2xl animate-pulse"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-foreground/10 rounded-2xl animate-pulse"></div>
          <div className="h-80 bg-foreground/10 rounded-2xl animate-pulse"></div>
        </div>
        
        <div className="h-20 bg-foreground/10 rounded-2xl animate-pulse"></div>
        <div className="h-96 bg-foreground/10 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Transfer History</h1>
          <p className="text-foreground/70">View and manage your file transfer records</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClearHistory}
          className="btn-secondary flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4 text-white" />
          <span className="text-white">Clear History</span>
        </motion.button>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <div className="glass-card p-4" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground/60 text-sm">Total Transfers</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
            <HistoryIcon className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="glass-card p-4" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground/60 text-sm">Uploads</p>
              <p className="text-2xl font-bold text-foreground">{stats.uploads}</p>
            </div>
            <Upload className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="glass-card p-4" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground/60 text-sm">Downloads</p>
              <p className="text-2xl font-bold text-foreground">{stats.downloads}</p>
            </div>
            <Download className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="glass-card p-4" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground/60 text-sm">Completed</p>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="glass-card p-4" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground/60 text-sm">Total Size</p>
              <p className="text-2xl font-bold text-foreground">{formatFileSize(stats.totalSize)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="glass-card p-6" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Transfer Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="hsl(var(--foreground) / 0.6)" />
              <YAxis stroke="hsl(var(--foreground) / 0.6)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background) / 0.8)', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px'
                }}
              />
              <Line type="monotone" dataKey="uploads" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="downloads" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6" style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Transfer Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Uploads', value: stats.uploads, color: '#3B82F6' },
              { name: 'Downloads', value: stats.downloads, color: '#10B981' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground) / 0.1)" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground) / 0.6)" />
              <YAxis stroke="hsl(var(--foreground) / 0.6)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background) / 0.8)', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px'
                }}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/60" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="upload">Uploads</option>
            <option value="download">Downloads</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>
      </motion.div>

      {/* Transfer List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderRadius: '1rem',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Transfer Records ({filteredTransfers.length})
        </h3>

        {filteredTransfers.length === 0 ? (
          <div className="text-center py-12">
            <HistoryIcon className="w-16 h-16 text-foreground/40 mx-auto mb-4" />
            <p className="text-foreground/60 text-lg mb-2">No transfers found</p>
            <p className="text-foreground/40">Try adjusting your filters or start sharing files</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTransfers.map((transfer, index) => (
              <motion.div
                key={transfer.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center space-x-4 p-4 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
              >
                <div className="text-akash-400">
                  {getFileIconComponent(transfer.fileType)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-foreground font-medium truncate">{transfer.fileName || 'Unknown File'}</p>
                    {getStatusIcon(transfer.status)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-foreground/60">
                    <span>{formatFileSize(transfer.fileSize)}</span>
                    <span>•</span>
                    <span className="capitalize">{transfer.direction}</span>
                    <span>•</span>
                    <span>{formatDate(transfer.startTime)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {transfer.direction === 'upload' ? (
                    <Upload className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Download className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default History;