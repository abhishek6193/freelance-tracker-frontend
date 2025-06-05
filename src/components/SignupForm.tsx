import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { setAuth } from '../slices/authSlice';
import AuthCard from './AuthCard';
import { request } from '../services/request';
import { AUTH_API } from '../services/apiRoutes';
import { GoogleLogin } from '@react-oauth/google';
import Button from './common/Button';

const SignupForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await request({
        url: AUTH_API.SIGNUP,
        method: 'POST',
        data: { name, email, password },
      });
      dispatch(
        setAuth({
          user: data.user,
          token: data.token,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
        })
      );
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);
    try {
      const idToken = credentialResponse.credential;
      const data = await request({
        url: AUTH_API.GOOGLE,
        method: 'POST',
        data: { idToken },
      });
      dispatch(
        setAuth({
          user: data.user,
          token: data.token,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
        })
      );
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed.');
  };

  return (
    <AuthCard title="Create Your Account">
      <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input input-bordered w-full px-4 py-2 rounded border border-gray-300 focus:border-primary focus:outline-none"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          className="input input-bordered w-full px-4 py-2 rounded border border-gray-300 focus:border-primary focus:outline-none"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="input input-bordered w-full px-4 py-2 rounded border border-gray-300 focus:border-primary focus:outline-none"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          className="w-full py-2 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
        <div className="w-full flex flex-col gap-2">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            width="100%"
            useOneTap
          />
        </div>
        {error && <div className="text-error text-sm text-center mt-2">{error}</div>}
        <div className="text-center text-sm mt-2">
          Already have an account?{' '}
          <Button
            type="button"
            className="text-primary underline hover:text-primary-dark"
            color="secondary"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            Login
          </Button>
        </div>
      </form>
    </AuthCard>
  );
};

export default SignupForm;
