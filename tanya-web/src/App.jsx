import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Reader from './pages/Reader';
import GroupDetails from './pages/GroupDetails';
import Segula from './pages/Segula';

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/feed" element={
        <SocketProvider>
          <Feed />
        </SocketProvider>
      } />
      <Route path="/group/:groupId" element={<Reader />} />
      <Route path="/group-details/:groupId" element={<GroupDetails />} />
      <Route path="/segula" element={<Segula />} />
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  );
}

function App() {
  // Use BrowserRouter on client, StaticRouter is used in entry-server.jsx
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
