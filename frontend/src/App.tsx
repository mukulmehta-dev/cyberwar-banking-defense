import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/game/:sessionId" element={<Game />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
