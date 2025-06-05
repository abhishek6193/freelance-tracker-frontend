import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { request } from '../../services/request';
import { updateClient } from '../../slices/clientsSlice';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import ActionMenu from '../common/ActionMenu';
import ClientViewModal from './ClientViewModal';
import ClientEditModal from './ClientEditModal';
import ClientDeleteConfirmModal from './ClientDeleteConfirmModal';

interface Client {
  _id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

interface ClientListItemProps {
  client: Client;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  onDeleteFromList?: (clientId: string) => void;
  onEditFromList?: (updated: Client) => void;
}

const ClientListItem: React.FC<ClientListItemProps> = ({
  client,
  openMenuId,
  setOpenMenuId,
  onDeleteFromList,
  onEditFromList,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showViewModal, setShowViewModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editSaving, setEditSaving] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();

  // Placeholder handlers
  const handleView = () => setShowViewModal(true);
  const handleEdit = async (form?: Partial<Client>) => {
    if (!form) {
      setShowEditModal(true);
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      // PATCH /api/clients/:id
      const updated = await request<Client>({
        url: `/clients/${client._id}`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        data: form,
      });
      dispatch(updateClient({ ...client, ...form }));
      if (onEditFromList) onEditFromList(updated);
      setShowEditModal(false);
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update client');
    } finally {
      setEditSaving(false);
    }
  };
  const handleDelete = () => {
    setShowDeleteModal(true);
  };
  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await request({
        url: `/clients/${client._id}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onDeleteFromList) onDeleteFromList(client._id);
      setShowDeleteModal(false);
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete client');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <tr>
        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
          <div className="flex items-center gap-3">
            <Avatar name={client.name} size={32} />
            <button
              style={{ cursor: 'pointer' }}
              onClick={handleView}
              aria-label={`View details for ${client.name}`}
              className="hover:underline text-indigo-600 hover:text-indigo-800 transition-colors duration-150 focus:outline-none"
            >
              {client.name}
            </button>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{client.contactEmail || '-'}</td>
        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{client.contactPhone || '-'}</td>
        <td
          className="px-6 py-4 whitespace-nowrap text-right align-top relative"
          style={{ zIndex: openMenuId === client._id ? 50 : 1 }}
        >
          <Button
            ref={buttonRef}
            className="p-2 rounded-full"
            style={{ outline: 'none', boxShadow: 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === client._id ? null : client._id);
            }}
            aria-label="Open actions menu"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </Button>
          <ActionMenu
            open={openMenuId === client._id}
            anchorRef={buttonRef}
            onClose={() => setOpenMenuId(null)}
            items={[
              {
                label: 'View',
                icon: (
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12C3.5 7.5 7.5 4.5 12 4.5s8.5 3 9.75 7.5c-1.25 4.5-5.25 7.5-9.75 7.5s-8.5-3-9.75-7.5z"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ),
                onClick: handleView,
              },
              {
                label: 'Edit',
                icon: (
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4 1 1-4 12.362-12.726z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l3 3" />
                  </svg>
                ),
                onClick: () => handleEdit(),
              },
              {
                label: 'Delete',
                icon: (
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
                    />
                  </svg>
                ),
                onClick: handleDelete,
                danger: true,
              },
            ]}
          />
        </td>
      </tr>
      {showViewModal && (
        <ClientViewModal
          client={client}
          open={showViewModal}
          onClose={() => setShowViewModal(false)}
        />
      )}
      {showEditModal && (
        <ClientEditModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleEdit}
          saving={editSaving}
          error={editError}
          initialData={client}
        />
      )}
      {showDeleteModal && (
        <ClientDeleteConfirmModal
          open={showDeleteModal}
          clientName={client.name}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
          // Show error message if delete fails
          error={deleteError}
        />
      )}
    </>
  );
};

export default ClientListItem;
