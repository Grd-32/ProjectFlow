import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { Wifi, WifiOff, Download, Upload, FolderSync as Sync, AlertCircle } from 'lucide-react';

interface OfflineModeProps {
  isOnline: boolean;
}

const OfflineMode: React.FC<OfflineModeProps> = ({ isOnline }) => {
  const { addNotification } = useNotification();
  const [pendingSync, setPendingSync] = useState<any[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => {
      addNotification({
        type: 'success',
        title: 'Back Online',
        message: 'Connection restored. Syncing pending changes...',
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'sync',
          name: 'Offline Sync'
        }
      });
      syncPendingChanges();
    };

    const handleOffline = () => {
      addNotification({
        type: 'warning',
        title: 'Working Offline',
        message: 'No internet connection. Changes will sync when online.',
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'offline',
          name: 'Offline Mode'
        }
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncPendingChanges = async () => {
    if (pendingSync.length === 0) return;

    setSyncInProgress(true);
    
    try {
      // Simulate syncing pending changes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPendingSync([]);
      setLastSync(new Date());
      
      addNotification({
        type: 'success',
        title: 'Sync Complete',
        message: `${pendingSync.length} changes synced successfully`,
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'sync',
          name: 'Data Sync'
        }
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: 'Failed to sync pending changes',
        userId: '1',
        relatedEntity: {
          type: 'project',
          id: 'sync',
          name: 'Sync Error'
        }
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  const addPendingChange = (change: any) => {
    setPendingSync(prev => [...prev, { ...change, timestamp: new Date().toISOString() }]);
  };

  if (isOnline && pendingSync.length === 0) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 p-4 rounded-lg shadow-lg border ${
      isOnline 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          isOnline 
            ? 'bg-green-100 dark:bg-green-900/30'
            : 'bg-yellow-100 dark:bg-yellow-900/30'
        }`}>
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <WifiOff className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          )}
        </div>
        <div>
          <p className={`text-sm font-medium ${
            isOnline 
              ? 'text-green-900 dark:text-green-100'
              : 'text-yellow-900 dark:text-yellow-100'
          }`}>
            {isOnline ? 'Online' : 'Offline Mode'}
          </p>
          {pendingSync.length > 0 && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {pendingSync.length} changes pending sync
            </p>
          )}
          {lastSync && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last sync: {lastSync.toLocaleTimeString()}
            </p>
          )}
        </div>
        {isOnline && pendingSync.length > 0 && (
          <button
            onClick={syncPendingChanges}
            disabled={syncInProgress}
            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors disabled:opacity-50"
          >
            {syncInProgress ? (
              <Sync className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineMode;