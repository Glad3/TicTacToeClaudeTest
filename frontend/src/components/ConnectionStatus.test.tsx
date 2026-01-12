import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConnectionStatus } from './ConnectionStatus';

describe('ConnectionStatus', () => {
  it('shows connected status', () => {
    render(
      <ConnectionStatus
        syncStatus="connected"
        opponentConnected={true}
        lastSyncTime={Date.now()}
      />
    );

    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('shows connecting status', () => {
    render(
      <ConnectionStatus
        syncStatus="connecting"
        opponentConnected={false}
        lastSyncTime={null}
      />
    );

    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('shows syncing status', () => {
    render(
      <ConnectionStatus
        syncStatus="syncing"
        opponentConnected={true}
        lastSyncTime={Date.now()}
      />
    );

    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('shows error status', () => {
    render(
      <ConnectionStatus
        syncStatus="error"
        opponentConnected={false}
        lastSyncTime={null}
      />
    );

    expect(screen.getByText('Connection error')).toBeInTheDocument();
  });

  it('shows disconnected status', () => {
    render(
      <ConnectionStatus
        syncStatus="disconnected"
        opponentConnected={false}
        lastSyncTime={null}
      />
    );

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('shows opponent online when connected', () => {
    render(
      <ConnectionStatus
        syncStatus="connected"
        opponentConnected={true}
        opponentName="Player 2"
        lastSyncTime={Date.now()}
      />
    );

    expect(screen.getByText('Player 2: Online')).toBeInTheDocument();
  });

  it('shows opponent offline when disconnected', () => {
    render(
      <ConnectionStatus
        syncStatus="connected"
        opponentConnected={false}
        opponentName="Player 2"
        lastSyncTime={Date.now()}
      />
    );

    expect(screen.getByText('Player 2: Offline')).toBeInTheDocument();
  });

  it('uses default opponent name when not provided', () => {
    render(
      <ConnectionStatus
        syncStatus="connected"
        opponentConnected={true}
        lastSyncTime={Date.now()}
      />
    );

    expect(screen.getByText('Opponent: Online')).toBeInTheDocument();
  });

  it('shows retry button on error', () => {
    const handleRefresh = vi.fn();
    render(
      <ConnectionStatus
        syncStatus="error"
        opponentConnected={false}
        lastSyncTime={null}
        onRefresh={handleRefresh}
      />
    );

    const retryButton = screen.getByRole('button', { name: /retry connection/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button when connected', () => {
    const handleRefresh = vi.fn();
    render(
      <ConnectionStatus
        syncStatus="connected"
        opponentConnected={true}
        lastSyncTime={Date.now()}
        onRefresh={handleRefresh}
      />
    );

    expect(screen.queryByRole('button', { name: /retry connection/i })).not.toBeInTheDocument();
  });

  it('shows "Just now" for recent sync', () => {
    render(
      <ConnectionStatus
        syncStatus="connected"
        opponentConnected={true}
        lastSyncTime={Date.now() - 2000} // 2 seconds ago
      />
    );

    expect(screen.getByText('Just now')).toBeInTheDocument();
  });

  it('shows seconds ago for older sync', () => {
    render(
      <ConnectionStatus
        syncStatus="connected"
        opponentConnected={true}
        lastSyncTime={Date.now() - 30000} // 30 seconds ago
      />
    );

    expect(screen.getByText('30s ago')).toBeInTheDocument();
  });

  it('has proper accessibility role', () => {
    render(
      <ConnectionStatus
        syncStatus="connected"
        opponentConnected={true}
        lastSyncTime={Date.now()}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
