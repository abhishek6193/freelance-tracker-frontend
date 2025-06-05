import React from 'react';
import EntityModal, { EntityModalField } from '../common/EntityModal';

interface Client {
  _id?: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

interface ClientEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: Partial<Client>) => Promise<void> | void;
  saving?: boolean;
  error?: string | null;
  initialData?: Partial<Client>;
}

const clientFields: EntityModalField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'contactEmail', label: 'Email', type: 'email' },
  { name: 'contactPhone', label: 'Phone', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

const ClientEditModal: React.FC<ClientEditModalProps> = ({
  open,
  onClose,
  onSave,
  saving,
  error,
  initialData,
}) => {
  return (
    <EntityModal
      open={open}
      onClose={onClose}
      onSubmit={onSave}
      fields={clientFields}
      initialData={initialData}
      title={initialData?._id ? 'Edit Client' : 'Add Client'}
      submitLabel={saving ? 'Saving...' : 'Save'}
      loading={saving}
    >
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
    </EntityModal>
  );
};

export default ClientEditModal;
