import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Memoization utility for better performance
const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

const useStore = create(
  persist(
    (set, get) => ({
      // Theme state
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // File transfer state
      transfers: [],
      currentTransfer: null,
      transferHistory: [],

      // Add new transfer
      addTransfer: (transfer) => {
        const newTransfer = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          ...transfer,
          status: 'pending',
          progress: 0,
          startTime: Date.now(),
          endTime: null
        };
        
        set((state) => ({
          transfers: [...state.transfers, newTransfer],
          currentTransfer: newTransfer
        }));
      },

      // Update transfer progress with batching for better performance
      updateTransferProgress: (id, progress, status = null) => {
        set((state) => ({
          transfers: state.transfers.map(transfer =>
            transfer.id === id
              ? { ...transfer, progress, status: status || transfer.status }
              : transfer
          ),
          currentTransfer: state.currentTransfer?.id === id
            ? { ...state.currentTransfer, progress, status: status || state.currentTransfer.status }
            : state.currentTransfer
        }));
      },

      // Complete transfer
      completeTransfer: (id, status = 'completed') => {
        set((state) => {
          const updatedTransfers = state.transfers.map(transfer =>
            transfer.id === id
              ? { ...transfer, status, progress: 100, endTime: Date.now() }
              : transfer
          );

          const completedTransfer = updatedTransfers.find(t => t.id === id);
          
          return {
            transfers: updatedTransfers,
            transferHistory: completedTransfer 
              ? [...state.transferHistory, completedTransfer]
              : state.transferHistory,
            currentTransfer: null
          };
        });
      },

      // Clear completed transfers
      clearCompletedTransfers: () => {
        set((state) => ({
          transfers: state.transfers.filter(t => t.status === 'pending' || t.status === 'uploading'),
          currentTransfer: null
        }));
      },

      // Clear history
      clearHistory: () => set({ transferHistory: [] }),

      // Settings
      settings: {
        autoStart: true,
        notifications: true,
        language: 'en',
        maxFileSize: 100 * 1024 * 1024, // 100MB
        codeExpiry: 24 * 60 * 60 * 1000, // 24 hours
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      // Share codes
      shareCodes: [],
      addShareCode: (code, fileInfo) => {
        const shareCode = {
          code,
          fileInfo,
          createdAt: Date.now(),
          expiresAt: Date.now() + get().settings.codeExpiry
        };
        
        set((state) => ({
          shareCodes: [...state.shareCodes, shareCode]
        }));
      },

      removeShareCode: (code) => {
        set((state) => ({
          shareCodes: state.shareCodes.filter(sc => sc.code !== code)
        }));
      },

      // Clean up expired codes with memoization
      cleanupExpiredCodes: memoize(() => {
        const now = Date.now();
        set((state) => ({
          shareCodes: state.shareCodes.filter(sc => sc.expiresAt > now)
        }));
      }),

      // UI state
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Notifications with optimized handling
      notifications: [],
      addNotification: (notification) => {
        const newNotification = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          ...notification,
          timestamp: Date.now()
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }));

        // Auto remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(newNotification.id);
        }, 5000);
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'akash-share-storage',
      partialize: (state) => ({
        theme: state.theme,
        transferHistory: state.transferHistory,
        settings: state.settings,
        shareCodes: state.shareCodes,
        sidebarOpen: state.sidebarOpen,
      }),
      // Add versioning for storage
      version: 1
    }
  )
);

export default useStore;