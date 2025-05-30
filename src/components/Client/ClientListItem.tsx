import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { request } from '../../services/request';
import { updateClient } from '../../slices/clientsSlice';
import ClientActionsMenu from './ClientActionsMenu';
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
          <button
            className="hover:underline text-indigo-600 hover:text-indigo-800 transition-colors duration-150 focus:outline-none"
            style={{ cursor: 'pointer' }}
            onClick={handleView}
            aria-label={`View details for ${client.name}`}
          >
            {client.name}
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{client.contactEmail || '-'}</td>
        <td className="px-6 py-4 whitespace-nowrap text-gray-700">{client.contactPhone || '-'}</td>
        <td
          className="px-6 py-4 whitespace-nowrap text-right align-top relative"
          style={{ zIndex: openMenuId === client._id ? 50 : 1 }}
        >
          <button
            ref={buttonRef}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-0"
            style={{ outline: 'none', boxShadow: 'none' }}
            onClick={() => setOpenMenuId(openMenuId === client._id ? null : client._id)}
            aria-label="Open actions menu"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-40">
            <div
              style={(() => {
                if (!buttonRef.current) return {};
                const rect = buttonRef.current.getBoundingClientRect();
                const menuWidth = 144; // 9rem in px
                const padding = 8; // px from edge
                let left = rect.left;
                if (left + menuWidth + padding > window.innerWidth) {
                  left = window.innerWidth - menuWidth - padding;
                }
                left = Math.max(left, padding);
                return {
                  position: 'absolute',
                  left,
                  top: rect.bottom + window.scrollY,
                  minWidth: menuWidth,
                  zIndex: 50,
                  pointerEvents: openMenuId === client._id ? 'auto' : 'none',
                };
              })()}
            >
              <ClientActionsMenu
                open={openMenuId === client._id}
                onClose={() => setOpenMenuId(null)}
                onView={handleView}
                onEdit={() => handleEdit()}
                onDelete={handleDelete}
                anchorRef={buttonRef}
              />
            </div>
          </div>
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
