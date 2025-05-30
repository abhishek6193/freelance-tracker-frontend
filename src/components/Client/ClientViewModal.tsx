import React from 'react';

interface Client {
  _id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

interface ClientViewModalProps {
  client: Client;
  open: boolean;
  onClose: () => void;
}

const ClientViewModal: React.FC<ClientViewModalProps> = ({ client, open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close view modal"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">{client.name}</h2>
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Email:</span> {client.contactEmail || '-'}
        </div>
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Phone:</span> {client.contactPhone || '-'}
        </div>
        {client.notes && (
          <div className="mb-4 text-gray-700">
            <span className="font-semibold">Notes:</span> {client.notes}
          </div>
        )}
        <button
          className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow"
          onClick={() => (window.location.href = `/clients/${client._id}`)}
        >
          Manage
        </button>
      </div>
    </div>
  );
};

export default ClientViewModal;
