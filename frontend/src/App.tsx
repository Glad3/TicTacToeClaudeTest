import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Lobby } from './components/Lobby';
import { LocalGame } from './components/LocalGame';
import { CreateGame } from './components/CreateGame';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/local" element={<LocalGame />} />
        <Route path="/create" element={<CreateGame />} />
        <Route path="/join" element={<div>Join Online Game (Coming Soon)</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
