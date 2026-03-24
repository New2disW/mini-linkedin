import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import NetworkPage from './pages/NetworkPage';
import JobsPage from './pages/JobsPage';

function ProtectedLayout({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return (
    <SocketProvider>
      <div className="app-layout">
        <Navbar />
        <LeftSidebar />
        <main className="main-content">{children}</main>
        <RightSidebar />
      </div>
    </SocketProvider>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/feed" replace /> : <AuthPage />} />
      <Route path="/feed" element={<ProtectedLayout><FeedPage /></ProtectedLayout>} />
      <Route path="/network" element={<ProtectedLayout><NetworkPage /></ProtectedLayout>} />
      <Route path="/jobs" element={<ProtectedLayout><JobsPage /></ProtectedLayout>} />
      <Route path="/profile/:id" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
