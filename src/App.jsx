import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ScreenShareTest from './pages/ScreenShareTest';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/screen-test" element={<ScreenShareTest />} />
      </Routes>
    </Router>
  );
}

export default App;
