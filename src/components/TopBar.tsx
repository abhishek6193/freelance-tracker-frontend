import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout as logoutAction } from '../slices/authSlice';
import { AUTH_API } from '../services/apiRoutes';
import { request } from '../services/request';

const TopBar: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);
  const dispatch = useDispatch();
  const [error, setError] = React.useState<string | null>(null);

  const handleLogout = async () => {
    setError(null);
    try {
      await request({
        url: AUTH_API.LOGOUT,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        data: { refreshToken },
      });
      dispatch(logoutAction());
    } catch (err: any) {
      setError(err.message || 'Logout failed. Please try again.');
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b border-gray-100">
      <div className="flex items-center gap-2">
        <img src="/ft-logo.svg" alt="Freelance Tracker Logo" className="w-8 h-8" />
        <span className="text-xl font-bold text-primary">Freelance Tracker</span>
      </div>
      {user ? (
        <>
          <button
            onClick={handleLogout}
            className="bg-primary text-white px-4 py-1 rounded hover:bg-primary-dark transition text-sm font-medium"
          >
            Logout
          </button>
          {error && (
            <div className="ml-4 text-error text-sm bg-rose-50 border border-rose-200 rounded px-3 py-1">
              {error}
            </div>
          )}
        </>
      ) : (
        <span className="text-sm text-gray-400 font-medium hidden sm:block">
          Track. Invoice. Succeed.
        </span>
      )}
    </header>
  );
};

export default TopBar;
