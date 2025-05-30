import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setClients, setClientsLoading, setClientsError } from '../slices/clientsSlice';
import { request } from '../services/request';

export function useClientsManager() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const clients = useSelector((state: RootState) => state.clients.data);
  const loading = useSelector((state: RootState) => state.clients.loading);
  const error = useSelector((state: RootState) => state.clients.error);

  useEffect(() => {
    if (!token) return;
    dispatch(setClientsLoading(true));
    request({
      url: '/clients',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => dispatch(setClients(data)))
      .catch((err) => dispatch(setClientsError(err?.message || 'Failed to fetch clients')))
      .finally(() => dispatch(setClientsLoading(false)));
  }, [token, dispatch]);

  return { clients, loading, error };
}
