import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Reader from './pages/Reader';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/feed" element={
            <SocketProvider>
              <Feed />
            </SocketProvider>
          } />
          <Route path="/reader/:groupId" element={<Reader />} />
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
