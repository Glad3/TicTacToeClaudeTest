import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { JoinGame } from './JoinGame';
import * as api from '../services/api';

vi.mock('../services/api');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderJoinGame(initialRoute = '/join') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <JoinGame />
    </MemoryRouter>
  );
}

describe('JoinGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders join game form', () => {
    renderJoinGame();

    expect(screen.getByRole('heading', { name: 'Join Game' })).toBeInTheDocument();
    expect(screen.getByLabelText(/room code or url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join game/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to lobby/i })).toBeInTheDocument();
  });

  it('renders help section', () => {
    renderJoinGame();

    expect(screen.getByText('How to Join')).toBeInTheDocument();
    expect(screen.getByText(/enter the room code shared by your friend/i)).toBeInTheDocument();
  });

  it('disables submit button when input is empty', () => {
    renderJoinGame();

    const submitButton = screen.getByRole('button', { name: /join game/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when input has value', async () => {
    const user = userEvent.setup();
    renderJoinGame();

    const input = screen.getByLabelText(/room code or url/i);
    const submitButton = screen.getByRole('button', { name: /join game/i });

    await user.type(input, 'room-abc123');

    expect(submitButton).not.toBeDisabled();
  });

  it('successfully joins room with valid room code', async () => {
    const user = userEvent.setup();
    vi.mocked(api.joinRoom).mockResolvedValue({
      success: true,
      message: 'Joined room successfully',
      roomId: 'room-abc123',
      playerMarker: 'O',
    });

    renderJoinGame();

    const input = screen.getByLabelText(/room code or url/i);
    const submitButton = screen.getByRole('button', { name: /join game/i });

    await user.type(input, 'room-abc123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.joinRoom).toHaveBeenCalledWith('room-abc123');
      expect(mockNavigate).toHaveBeenCalledWith('/room/room-abc123');
    });
  });

  it('successfully joins room from full URL', async () => {
    const user = userEvent.setup();
    vi.mocked(api.joinRoom).mockResolvedValue({
      success: true,
      message: 'Joined room successfully',
      roomId: 'room-test123',
    });

    renderJoinGame();

    const input = screen.getByLabelText(/room code or url/i);
    const submitButton = screen.getByRole('button', { name: /join game/i });

    await user.type(input, 'http://localhost:3000/room/room-test123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.joinRoom).toHaveBeenCalledWith('room-test123');
      expect(mockNavigate).toHaveBeenCalledWith('/room/room-test123');
    });
  });

  it('successfully joins room from relative path', async () => {
    const user = userEvent.setup();
    vi.mocked(api.joinRoom).mockResolvedValue({
      success: true,
      message: 'Joined room successfully',
      roomId: 'room-xyz789',
    });

    renderJoinGame();

    const input = screen.getByLabelText(/room code or url/i);
    const submitButton = screen.getByRole('button', { name: /join game/i });

    await user.type(input, '/room/room-xyz789');
    await user.click(submitButton);

    await waitFor(() => {
      expect(api.joinRoom).toHaveBeenCalledWith('room-xyz789');
      expect(mockNavigate).toHaveBeenCalledWith('/room/room-xyz789');
    });
  });

  it('shows error for invalid room code format', async () => {
    const user = userEvent.setup();
    renderJoinGame();

    const input = screen.getByLabelText(/room code or url/i);
    const submitButton = screen.getByRole('button', { name: /join game/i });

    await user.type(input, 'invalid-code');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid room code or url format/i)).toBeInTheDocument();
    });

    expect(api.joinRoom).not.toHaveBeenCalled();
  });

  it('shows error when room is not found (404)', async () => {
    const user = userEvent.setup();
    vi.mocked(api.joinRoom).mockRejectedValue(new Error('API error: 404'));

    renderJoinGame();

    const input = screen.getByLabelText(/room code or url/i);
    const submitButton = screen.getByRole('button', { name: /join game/i });

    await user.type(input, 'room-notfound');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/room not found/i)).toBeInTheDocument();
    });
  });

  it('shows error when room is full (403)', async () => {
    const user = userEvent.setup();
    vi.mocked(api.joinRoom).mockRejectedValue(new Error('API error: 403'));

    renderJoinGame();

    const input = screen.getByLabelText(/room code or url/i);
    const submitButton = screen.getByRole('button', { name: /join game/i });

    await user.type(input, 'room-full123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/room is full/i)).toBeInTheDocument();
    });
  });

  it('shows error when API returns success: false', async () => {
    const user = userEvent.setup();
    vi.mocked(api.joinRoom).mockResolvedValue({
      success: false,
      message: 'Room is closed',
    });

    renderJoinGame();

    const input = screen.getByLabelText(/room code or url/i);
    const submitButton = screen.getByRole('button', { name: /join game/i });

    await user.type(input, 'room-closed');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/room is closed/i)).toBeInTheDocument();
    });
  });

  it('shows generic error for unexpected errors', async () => {
    const user = userEvent.setup();
    vi.mocked(api.joinRoom).mockRejectedValue(new Error('Network error'));

    renderJoinGame();

    const input = screen.getByLabelText(/room code or url/i);
    const submitButton = screen.getByRole('button', { name: /join game/i });

    await user.type(input, 'room-abc123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to join room/i)).toBeInTheDocument();
    });
  });

  it('shows joining state while request is in progress', async () => {
    const user = userEvent.setup();
    vi.mocked(api.joinRoom).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, message: 'Success' }), 100))
    );

    renderJoinGame();

    const input = screen.getByLabelText(/room code or url/i);
    const submitButton = screen.getByRole('button', { name: /join game/i });

    await user.type(input, 'room-abc123');
    await user.click(submitButton);

    expect(screen.getByRole('button', { name: /joining.../i })).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /back to lobby/i })).toBeDisabled();
  });

  it('navigates to lobby when back button is clicked', async () => {
    const user = userEvent.setup();
    renderJoinGame();

    const backButton = screen.getByRole('button', { name: /back to lobby/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('detects room code from URL parameter', () => {
    renderJoinGame('/join?room=room-fromurl');

    expect(screen.getByText(/room code detected/i)).toBeInTheDocument();
    expect(screen.getByText('room-fromurl')).toBeInTheDocument();
  });

  it('auto-fills input when "Use This Code" button is clicked', async () => {
    const user = userEvent.setup();
    renderJoinGame('/join?room=room-fromurl');

    const useButton = screen.getByRole('button', { name: /use this code/i });
    await user.click(useButton);

    const input = screen.getByLabelText(/room code or url/i) as HTMLInputElement;
    expect(input.value).toBe('room-fromurl');
  });

  it('hides URL detected banner after auto-fill', async () => {
    const user = userEvent.setup();
    renderJoinGame('/join?room=room-fromurl');

    const useButton = screen.getByRole('button', { name: /use this code/i });
    await user.click(useButton);

    expect(screen.queryByText(/room code detected/i)).not.toBeInTheDocument();
  });

  it('clears error when input changes', async () => {
    const user = userEvent.setup();
    renderJoinGame();

    const input = screen.getByLabelText(/room code or url/i);
    const submitButton = screen.getByRole('button', { name: /join game/i });

    // Trigger an error
    await user.type(input, 'invalid');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid room code or url format/i)).toBeInTheDocument();
    });

    // Clear input and error should still show
    await user.clear(input);
    expect(screen.getByText(/invalid room code or url format/i)).toBeInTheDocument();
  });

  it('sets aria-invalid when there is an error', async () => {
    const user = userEvent.setup();
    renderJoinGame();

    const input = screen.getByLabelText(/room code or url/i);
    const submitButton = screen.getByRole('button', { name: /join game/i });

    await user.type(input, 'invalid');
    await user.click(submitButton);

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'join-error');
    });
  });

  it('error message has proper ARIA attributes', async () => {
    const user = userEvent.setup();
    renderJoinGame();

    const input = screen.getByLabelText(/room code or url/i);
    const submitButton = screen.getByRole('button', { name: /join game/i });

    await user.type(input, 'invalid');
    await user.click(submitButton);

    await waitFor(() => {
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
      expect(errorElement).toHaveAttribute('id', 'join-error');
    });
  });
});
