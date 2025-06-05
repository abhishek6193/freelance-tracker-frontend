import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import './App.css';
import TopBar from './components/TopBar';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { RootState } from './store';
import { setAuth, logout, setRehydrating } from './slices/authSlice';
import SessionTimeoutModal from './components/SessionTimeoutModal';
import { API_BASE_URL } from './services/apiBase';
import DashboardPage from './pages/Dashboard';
import ClientsPage from './pages/Clients';
import ClientDetailsPage from './pages/ClientDetails';
import SidebarNav from './components/SidebarNav';
import { AppManager } from './components/manager';

const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const rehydrating = useSelector((state: RootState) => state.auth.rehydrating);
  const location = useLocation();
  if (rehydrating) return null; // Don't redirect while rehydrating
  if (user) {
    // If user is authenticated, redirect from /login or /signup to /dashboard
    if (location.pathname === '/login' || location.pathname === '/signup') {
      return <Navigate to="/dashboard" replace />;
    }
  } else {
    // If not authenticated, redirect from / to /login
    if (location.pathname === '/') {
      return <Navigate to="/login" replace />;
    }
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [sessionTimeout, setSessionTimeout] = React.useState(false);

  // Redirect to /login if not authenticated and not already on /login or /signup
  useEffect(() => {
    if (auth.rehydrating) return; // Don't redirect while rehydrating
    if (!auth.user && !['/login', '/signup'].includes(window.location.pathname)) {
      window.location.replace('/login');
    }
  }, [auth.user, auth.rehydrating]);

  useEffect(() => {
    // Rehydrate auth state from localStorage on app load
    dispatch(setRehydrating(true));
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.user && parsed.token && parsed.refreshToken) {
          dispatch(setAuth(parsed));
        }
      } catch (e) {
        // Could not parse auth data, ignore and start with empty state
      }
    }
    dispatch(setRehydrating(false));
  }, [dispatch]);

  // Token refresh logic
  useEffect(() => {
    if (!auth.token || !auth.refreshToken || !auth.expiresAt) return;
    const checkAndRefresh = async () => {
      if (!auth.expiresAt || !auth.refreshToken) return;
      const now = Date.now();
      const timeLeft = auth.expiresAt - now;
      if (timeLeft < 3 * 60 * 1000) {
        // less than 3 minutes
        try {
          const res = await axios.post(API_BASE_URL + '/auth/refresh-token', {
            refreshToken: auth.refreshToken,
          });
          if (res.data && res.data.token && res.data.expiresAt) {
            dispatch(
              setAuth({
                user: auth.user,
                token: res.data.token,
                refreshToken: auth.refreshToken as string,
                expiresAt: res.data.expiresAt,
              })
            );
          } else {
            dispatch(logout());
            setSessionTimeout(true);
          }
        } catch {
          dispatch(logout());
          setSessionTimeout(true);
        }
      }
    };
    const interval = setInterval(checkAndRefresh, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, [auth.token, auth.refreshToken, auth.expiresAt, auth.user, dispatch]);

  return (
    <>
      <SessionTimeoutModal
        open={sessionTimeout}
        onLogin={() => {
          setSessionTimeout(false);
          window.location.href = '/login';
        }}
      />
      <Router>
        <TopBar />
        <AuthRedirect>
          <AppManager>
            {auth.user ? (
              <div className="flex min-h-screen">
                <SidebarNav />
                <div className="flex-1">
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route element={<ProtectedRoute />}>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/clients" element={<ClientsPage />} />
                      <Route path="/clients/:id" element={<ClientDetailsPage />} />
                    </Route>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            )}
          </AppManager>
        </AuthRedirect>
      </Router>
    </>
  );
};

export default App;
