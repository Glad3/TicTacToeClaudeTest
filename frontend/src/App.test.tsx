import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import * as api from './services/api';

vi.mock('./services/api');

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Lobby component on root path /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Tic Tac Toe')).toBeInTheDocument();
    expect(screen.getByText('Choose your game mode')).toBeInTheDocument();
  });

  it('renders LocalGame component on /local path', () => {
    render(
      <MemoryRouter initialEntries={['/local']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('renders CreateGame component on /create path', async () => {
    vi.mocked(api.createRoom).mockResolvedValue({
      success: true,
      roomId: 'room-test123',
      joinUrl: '/room/room-test123',
      message: 'Room created',
    });

    render(
      <MemoryRouter initialEntries={['/create']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/game room created/i)).toBeInTheDocument();
    });
  });

  it('renders Join placeholder on /join path', () => {
    render(
      <MemoryRouter initialEntries={['/join']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(/join online game \(coming soon\)/i)).toBeInTheDocument();
  });

  it('renders GameRoom component on /room/:roomId path', async () => {
    vi.mocked(api.getRoomState).mockResolvedValue({
      success: true,
      state: {
        board: Array(9).fill(null),
        currentPlayer: 'X',
        state: 'playing',
        winner: null,
      },
      room: {
        roomId: 'room-test123',
        status: 'waiting',
        playerX: {
          playerId: 'player1',
          name: 'Player 1',
          marker: 'X',
          isConnected: true,
          joinedAt: Date.now(),
          lastSeen: Date.now(),
        },
        playerO: null,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      },
      timestamp: Date.now(),
    });

    render(
      <MemoryRouter initialEntries={['/room/room-test123']}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/room: room-test123/i)).toBeInTheDocument();
    });
  });

  it('renders NotFound component for unknown paths', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-path']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders NotFound component for invalid routes', () => {
    render(
      <MemoryRouter initialEntries={['/this/does/not/exist']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('handles nested invalid paths', () => {
    render(
      <MemoryRouter initialEntries={['/local/extra/path']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
  });
});
