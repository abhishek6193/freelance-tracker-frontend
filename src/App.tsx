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
import { setAuth, logout } from './slices/authSlice';
import SessionTimeoutModal from './components/SessionTimeoutModal';
import { API_BASE_URL } from './services/apiBase';

const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();
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

  useEffect(() => {
    // Rehydrate auth state from localStorage on app load
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
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Dashboard (TODO)</div>} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthRedirect>
      </Router>
    </>
  );
};

export default App;
