import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import axios from 'axios';
import { API_BASE_URL } from '../../services/apiBase';
import ClientTasksSection from '../../components/Client/ClientTasksSection';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

const TABS = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'timeLogs', label: 'Time Logs' },
  { key: 'activity', label: 'Activity Feed' },
  { key: 'files', label: 'Files & Attachments' },
];

export default function ClientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState<any>(null);
  const clientsCache = useSelector((state: RootState) => state.clients.data);

  useEffect(() => {
    if (!id) return;
    // Try to find client in cache
    const cached = clientsCache?.find((c: any) => c._id === id);
    if (cached) {
      setClient(cached);
      return;
    }
    // Otherwise fetch from API
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/clients/${id}`)
      .then((res) => setClient(res.data))
      .catch(() => setClient(null))
      .finally(() => setLoading(false));
  }, [id, clientsCache]);

  if (loading) return <div className="p-8 text-center">Loading client details...</div>;
  if (!client) return <div className="p-8 text-center text-red-600">Client not found.</div>;

  return (
    <main className="max-w-5xl mx-auto w-full py-8 px-4">
      {/* Back to Clients */}
      <button className="mb-4 text-blue-600 hover:underline" onClick={() => window.history.back()}>
        {'< Back to Clients'}
      </button>

      {/* Client Info Card */}
      <div className="bg-white rounded shadow p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={client.name} size={64} className="mr-4" />
          <div>
            <div className="font-bold text-xl">{client.name}</div>
            <div className="text-gray-600 text-sm">
              {client.contactEmail} {client.contactPhone && `| ${client.contactPhone}`}
            </div>
            {client.llp && <div className="text-gray-600 text-sm">LLP: {client.llp}</div>}
            {client.tags && client.tags.length > 0 && (
              <div className="text-xs mt-1">
                Tags:{' '}
                {client.tags.map((tag: string, i: number) => (
                  <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded mr-1">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {client.notes && (
              <div className="text-gray-700 mt-2 text-sm">Notes: {client.notes}</div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button color="primary">Edit</Button>
          <Button color="danger">Delete</Button>
          <Button color="secondary">Share</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 -mb-px border-b-2 ${activeTab === tab.key ? 'border-blue-600 text-blue-700 font-semibold' : 'border-transparent text-gray-600'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section Content Placeholder */}
      <div className="bg-gray-50 rounded p-6 min-h-[200px]">
        {activeTab === 'tasks' && <ClientTasksSection clientId={client._id} />}
        {activeTab === 'invoices' && <div>Invoices section (to be implemented)</div>}
        {activeTab === 'timeLogs' && <div>Time Logs section (to be implemented)</div>}
        {activeTab === 'activity' && <div>Activity Feed section (to be implemented)</div>}
        {activeTab === 'files' && <div>Files & Attachments section (to be implemented)</div>}
      </div>
    </main>
  );
}
