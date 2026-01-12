import { SyncStatus } from '../hooks/useRoomSync';
import '../styles/connectionStatus.css';

export interface ConnectionStatusProps {
  syncStatus: SyncStatus;
  opponentConnected: boolean;
  opponentName?: string;
  lastSyncTime: number | null;
  onRefresh?: () => void;
}

export function ConnectionStatus({
  syncStatus,
  opponentConnected,
  opponentName = 'Opponent',
  lastSyncTime,
  onRefresh,
}: ConnectionStatusProps) {
  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'connected':
        return '●';
      case 'connecting':
      case 'syncing':
        return '◐';
      case 'error':
      case 'disconnected':
        return '○';
      default:
        return '○';
    }
  };

  const getStatusClass = () => {
    switch (syncStatus) {
      case 'connected':
        return 'connection-status__indicator--connected';
      case 'connecting':
      case 'syncing':
        return 'connection-status__indicator--syncing';
      case 'error':
      case 'disconnected':
        return 'connection-status__indicator--disconnected';
      default:
        return '';
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Connection error';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return null;
    const seconds = Math.floor((Date.now() - lastSyncTime) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return (
    <div className="connection-status" role="status" aria-live="polite">
      <div className="connection-status__row">
        <span
          className={`connection-status__indicator ${getStatusClass()}`}
          aria-hidden="true"
        >
          {getStatusIcon()}
        </span>
        <span className="connection-status__text">{getStatusText()}</span>
        {lastSyncTime && (
          <span className="connection-status__sync-time">
            {formatLastSync()}
          </span>
        )}
      </div>

      <div className="connection-status__opponent">
        <span
          className={`connection-status__indicator ${
            opponentConnected
              ? 'connection-status__indicator--connected'
              : 'connection-status__indicator--disconnected'
          }`}
          aria-hidden="true"
        >
          {opponentConnected ? '●' : '○'}
        </span>
        <span className="connection-status__opponent-text">
          {opponentName}: {opponentConnected ? 'Online' : 'Offline'}
        </span>
      </div>

      {syncStatus === 'error' && onRefresh && (
        <button
          className="connection-status__refresh"
          onClick={onRefresh}
          aria-label="Retry connection"
        >
          Retry
        </button>
      )}
    </div>
  );
}
