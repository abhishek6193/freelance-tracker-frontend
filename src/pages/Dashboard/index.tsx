import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Button from '../../components/common/Button';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const clientsState = useSelector((state: RootState) => state.clients);
  // If state.data is an array, use it directly; if it's an object with .data, use that
  const clients = Array.isArray(clientsState.data)
    ? clientsState.data
    : clientsState.data && Array.isArray((clientsState.data as any).data)
      ? (clientsState.data as any).data
      : [];
  const loading = clientsState.loading;

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </main>
    );
  }

  if (clients.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Welcome to Freelance Tracker!</h2>
          <p className="mb-6 text-gray-700 text-center">You have no clients or tasks yet.</p>
          <Button
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition w-full"
            color="primary"
            onClick={() => navigate('/clients')}
          >
            Add Your First Client
          </Button>
        </div>
      </main>
    );
  }

  // If clients exist, show a summary card
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2 text-primary">Clients Overview</h2>
        <p className="mb-4 text-gray-700 text-center">
          You have <span className="font-semibold text-indigo-600">{clients.length}</span> client
          {clients.length > 1 ? 's' : ''}.
        </p>
        <ul className="mb-4 w-full">
          {(clients as { _id: string; name: string; contactEmail?: string }[])
            .slice(0, 3)
            .map((client) => (
              <li
                key={client._id}
                className="py-2 border-b last:border-b-0 flex justify-between items-center"
              >
                <span className="font-medium text-gray-900">{client.name}</span>
                <span className="text-xs text-gray-500">{client.contactEmail || ''}</span>
              </li>
            ))}
        </ul>
        <Button
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition w-full"
          color="primary"
          onClick={() => navigate('/clients')}
        >
          View All Clients
        </Button>
      </div>
    </main>
  );
};

export default Dashboard;
