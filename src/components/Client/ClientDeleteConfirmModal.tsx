import React from 'react';
import EntityModal from '../common/EntityModal';

interface ClientDeleteConfirmModalProps {
  open: boolean;
  clientName: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  error?: string | null;
}

const ClientDeleteConfirmModal: React.FC<ClientDeleteConfirmModalProps> = ({
  open,
  clientName,
  onCancel,
  onConfirm,
  loading,
  error,
}) => {
  return (
    <EntityModal
      open={open}
      onClose={onCancel}
      onSubmit={onConfirm}
      fields={[]}
      title="Delete Client"
      submitLabel={loading ? 'Deleting...' : 'Delete'}
      loading={loading}
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold text-red-600 mb-2">Delete Client</h2>
        <p className="text-gray-700">
          Are you sure you want to delete <span className="font-semibold">{clientName}</span>? This
          action cannot be undone.
        </p>
      </div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
    </EntityModal>
  );
};

export default ClientDeleteConfirmModal;
