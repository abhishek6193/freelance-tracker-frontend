import React from 'react';

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
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">Delete Client</h2>
          <p className="text-gray-700">
            Are you sure you want to delete <span className="font-semibold">{clientName}</span>?
            This action cannot be undone.
          </p>
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDeleteConfirmModal;
