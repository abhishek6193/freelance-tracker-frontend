import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: { id: string; name: string; email: string } | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt?: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  expiresAt: null,
  loading: false,
  error: null,
};

// Save auth state to localStorage on login/signup/logout
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{
        user: AuthState['user'];
        token: string;
        refreshToken: string;
        expiresAt?: number;
      }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.expiresAt = action.payload.expiresAt || null;
      state.error = null;
      localStorage.setItem(
        'auth',
        JSON.stringify({
          user: action.payload.user,
          token: action.payload.token,
          refreshToken: action.payload.refreshToken,
          expiresAt: action.payload.expiresAt || null,
        })
      );
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.expiresAt = null;
      state.error = null;
      localStorage.removeItem('auth');
    },
  },
});

export const { setAuth, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
