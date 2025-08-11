import React from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { Database, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const DatabaseStatus: React.FC = () => {
  const { isConnected, isLoading, checkConnection } = useDatabase();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-xs font-medium">Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
        isConnected 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      }`}>
        {isConnected ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span className="text-xs font-medium">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      {!isConnected && (
        <button
          onClick={checkConnection}
          className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded"
          title="Retry connection"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default DatabaseStatus;