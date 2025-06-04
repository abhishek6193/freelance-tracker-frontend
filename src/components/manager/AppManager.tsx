import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { request } from '../../services/request';

function getSortFromStorage() {
  const SORT_OPTIONS = [
    { label: 'Name (A-Z)', sort: 'name', order: 'asc' },
    { label: 'Name (Z-A)', sort: 'name', order: 'desc' },
    { label: 'Date Added (Newest)', sort: 'createdAt', order: 'desc' },
    { label: 'Date Added (Oldest)', sort: 'createdAt', order: 'asc' },
    { label: 'Last Modified (Newest)', sort: 'updatedAt', order: 'desc' },
    { label: 'Last Modified (Oldest)', sort: 'updatedAt', order: 'asc' },
  ];
  const s = localStorage.getItem('clientsSort');
  return s ? JSON.parse(s) : SORT_OPTIONS[2]; // default: Date Added (Newest)
}

interface AppManagerProps {
  children: React.ReactNode;
}

const AppManager: React.FC<AppManagerProps> = ({ children }) => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const [clientsLoading, setClientsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchClientsOnAppLoad() {
      if (!auth.token) {
        setClientsLoading(false);
        return;
      }
      setClientsLoading(true);
      const sortOption = getSortFromStorage();
      try {
        const params = {
          page: 1,
          limit: 20, // Fetch only the first batch of 20 clients
          sort: sortOption.sort,
          order: sortOption.order,
        };
        const res = await request({
          url: '/clients',
          method: 'GET',
          headers: { Authorization: `Bearer ${auth.token}` },
          params,
        });
        dispatch({ type: 'clients/setClients', payload: res.data });
      } catch (err) {
        // Optionally handle error
      } finally {
        setClientsLoading(false);
      }
    }
    fetchClientsOnAppLoad();
    // Only run on token change (app load or login)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token]);

  // You can add more global fetches here (e.g., user profile)

  // Only render children when all required data is loaded
  if (clientsLoading || authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  return <>{children}</>;
};

export default AppManager;
