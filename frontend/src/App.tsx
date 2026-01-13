import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Lobby } from './components/Lobby';
import { LocalGame } from './components/LocalGame';
import { CreateGame } from './components/CreateGame';
import { JoinGame } from './components/JoinGame';
import { GameRoom } from './components/GameRoom';
import { NotFound } from './components/NotFound';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter basename="/TicTacToeClaudeTest">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/local" element={<LocalGame />} />
        <Route path="/create" element={<CreateGame />} />
        <Route path="/join" element={<JoinGame />} />
        <Route path="/room/:roomId" element={<GameRoom />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
