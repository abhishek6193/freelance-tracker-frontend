import React from 'react';
import { useNavigate } from 'react-router-dom';
import EntityModal from '../common/EntityModal';

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
  const navigate = useNavigate();
  return (
    <EntityModal
      open={open}
      onClose={onClose}
      onSubmit={() => navigate(`/clients/${client._id}`)}
      fields={[]}
      title={client.name}
      submitLabel="Manage"
    >
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
    </EntityModal>
  );
};

export default ClientViewModal;
