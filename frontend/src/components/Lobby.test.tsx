import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Lobby } from './Lobby';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Lobby', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the lobby component', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    expect(screen.getByText('Tic Tac Toe')).toBeInTheDocument();
    expect(screen.getByText('Choose your game mode')).toBeInTheDocument();
  });

  it('renders all three buttons', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /play locally/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create online game/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /join online game/i })).toBeInTheDocument();
  });

  it('navigates to /local when Play Locally is clicked', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    const playLocallyButton = screen.getByRole('button', { name: /play locally/i });
    await user.click(playLocallyButton);

    expect(mockNavigate).toHaveBeenCalledWith('/local');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('navigates to /create when Create Online Game is clicked', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    const createButton = screen.getByRole('button', { name: /create online game/i });
    await user.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith('/create');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('navigates to /join when Join Online Game is clicked', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    const joinButton = screen.getByRole('button', { name: /join online game/i });
    await user.click(joinButton);

    expect(mockNavigate).toHaveBeenCalledWith('/join');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('has proper ARIA labels for accessibility', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    const playLocallyButton = screen.getByRole('button', { name: /play locally with two players on the same device/i });
    const createButton = screen.getByRole('button', { name: /create a new online game room to play with a friend/i });
    const joinButton = screen.getByRole('button', { name: /join an existing online game room using a room code/i });

    expect(playLocallyButton).toHaveAttribute('aria-label');
    expect(createButton).toHaveAttribute('aria-label');
    expect(joinButton).toHaveAttribute('aria-label');
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    const playLocallyButton = screen.getByRole('button', { name: /play locally/i });

    // Focus the button
    playLocallyButton.focus();
    expect(playLocallyButton).toHaveFocus();

    // Press Enter
    await user.keyboard('{Enter}');
    expect(mockNavigate).toHaveBeenCalledWith('/local');
  });

  it('displays help text for each game mode', () => {
    render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );

    expect(screen.getByText(/Play Locally:/i)).toBeInTheDocument();
    expect(screen.getByText(/Two players on the same device/i)).toBeInTheDocument();

    expect(screen.getByText(/Create Online:/i)).toBeInTheDocument();
    expect(screen.getByText(/Get a room code to share with a friend/i)).toBeInTheDocument();

    expect(screen.getByText(/Join Online:/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter a room code to join a friend's game/i)).toBeInTheDocument();
  });
});
