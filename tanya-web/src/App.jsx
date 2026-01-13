import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { logPageView, setAnalyticsUserId } from './utils/analytics';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Reader from './pages/Reader';
import GroupDetails from './pages/GroupDetails';
import Segula from './pages/Segula';

function AppContent() {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // Track page views
  useEffect(() => {
    const pageName = location.pathname;
    const pageTitle = document.title;
    logPageView(pageName, pageTitle);
  }, [location]);
  
  // Set user ID for analytics on login
  useEffect(() => {
    if (currentUser) {
      setAnalyticsUserId(currentUser.id);
    }
  }, [currentUser]);
  
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
