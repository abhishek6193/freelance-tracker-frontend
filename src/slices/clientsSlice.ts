import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Client {
  _id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

interface ClientsState {
  data: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  data: [],
  loading: false,
  error: null,
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setClients(state, action: PayloadAction<Client[]>) {
      state.data = action.payload;
      state.error = null;
    },
    setClientsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setClientsError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    addClient(state, action: PayloadAction<Client>) {
      state.data.unshift(action.payload);
    },
    updateClient(state, action: PayloadAction<Client>) {
      const idx = state.data.findIndex((c) => c._id === action.payload._id);
      if (idx !== -1) {
        state.data[idx] = { ...state.data[idx], ...action.payload };
      }
    },
    deleteClient(state, action: PayloadAction<string>) {
      state.data = state.data.filter((c) => c._id !== action.payload);
    },
  },
});

export const {
  setClients,
  setClientsLoading,
  setClientsError,
  addClient,
  updateClient,
  deleteClient,
} = clientsSlice.actions;
export default clientsSlice.reducer;
