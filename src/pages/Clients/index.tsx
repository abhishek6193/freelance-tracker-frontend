import React, { useState, useRef, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { request } from '../../services/request';
import { ClientListItem } from '../../components/Client';
import { CLIENT_SORT_OPTIONS } from '../../constants/clientSortOptions';
import '../../index.css';

interface Client {
  _id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
}

function getSortFromStorage() {
  const s = localStorage.getItem('clientsSort');
  return s ? JSON.parse(s) : CLIENT_SORT_OPTIONS[2]; // default: Date Added (Newest)
}

function setSortToStorage(sortObj: { sort: string; order: string; label: string }) {
  localStorage.setItem('clientsSort', JSON.stringify(sortObj));
}

const PAGE_SIZE = 20;

const ClientsPage: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const clientsState = useSelector((state: RootState) => state.clients);
  const loading = clientsState.loading;
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<Partial<Client>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState(() => getSortFromStorage());
  const [pages, setPages] = useState<Client[][]>([]); // each page is an array
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const dispatch = useDispatch();
  const tableRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null); // For IntersectionObserver

  const handleOpenAdd = () => {
    setForm({});
    setShowAddModal(true);
    setError(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddClient = async (client: Client) => {
    // Set sort to Date Added (Newest) and persist
    const newestSort = CLIENT_SORT_OPTIONS.find((opt) => opt.label === 'Date Added (Newest)');
    if (newestSort) {
      setSortOption(newestSort);
      setSortToStorage(newestSort);
    }
    setSaving(true);
    setError(null);
    try {
      // Re-fetch first page after adding
      const params = {
        page: 1,
        limit: PAGE_SIZE,
        sort: newestSort ? newestSort.sort : sortOption.sort,
        order: newestSort ? newestSort.order : sortOption.order,
      };
      const res = await request<{ data: Client[]; total: number; page: number; limit: number }>({
        url: '/clients',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setPages([res.data]);
      setCurrentPage(1);
      setHasMore(res.data.length === PAGE_SIZE);
      dispatch({ type: 'clients/setClients', payload: res.data });
    } catch (err: any) {
      setError(err?.message || 'Failed to refresh client list');
    } finally {
      setSaving(false);
      setShowAddModal(false);
      // After modal closes, scroll table to top to prevent auto-trigger of loadMore
      setTimeout(() => {
        if (tableRef.current) tableRef.current.scrollTop = 0;
      }, 0);
    }
  };

  const handleEditClient = (updated: Client) => {
    setPages((prev) =>
      prev.map((page) => page.map((c) => (c._id === updated._id ? { ...c, ...updated } : c)))
    );
    // If on first page, update Redux
    if (pages[0]?.some((c) => c._id === updated._id)) {
      dispatch({ type: 'clients/updateClient', payload: updated });
    }
  };

  // Handler for deleting a client
  const handleClientDelete = (clientId: string) => {
    // Find index in allClients
    const index = allClients.findIndex((c) => c._id === clientId);
    if (index > -1 && index < PAGE_SIZE) {
      // On first page: update Redux and local state
      dispatch({ type: 'clients/deleteClient', payload: clientId });
    }
    // Remove from local state (all pages)
    setPages((prev) => prev.map((page) => page.filter((c) => c._id !== clientId)));
  };

  // Load more pages on scroll
  const loadMore = React.useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    try {
      const params = {
        page: nextPage,
        limit: PAGE_SIZE,
        sort: sortOption.sort,
        order: sortOption.order,
      };
      const res = await request<{ data: Client[]; total: number; page: number; limit: number }>({
        url: '/clients',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setPages((prev) => [...prev, res.data]);
      setCurrentPage(nextPage);
      setHasMore(res.data.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentPage, sortOption.sort, sortOption.order, token]);

  // Place allClients and filteredClients declarations here, before any hooks that use them
  const allClients = pages.flat();
  const filteredClients = search.trim()
    ? allClients.filter(
        (c: Client) =>
          c.name.toLowerCase().includes(search.trim().toLowerCase()) ||
          (c.contactEmail && c.contactEmail.toLowerCase().includes(search.trim().toLowerCase()))
      )
    : allClients;

  // Debug: log when sentinel is present in the DOM
  useLayoutEffect(() => {
    const sentinel = sentinelRef.current;
    if (!hasMore || loadingMore) return;
    if (!sentinel) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        root: null, // Observe relative to the viewport
        rootMargin: '0px',
        threshold: 0, // Trigger as soon as any part is visible
      }
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [filteredClients.length, hasMore, loadingMore, loadMore]);

  // On mount or sort change, load first page and reset local state
  const prevSortRef = React.useRef<{ sort: string; order: string } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const isSortChanged =
      prevSortRef.current &&
      (prevSortRef.current.sort !== sortOption.sort ||
        prevSortRef.current.order !== sortOption.order);
    prevSortRef.current = { sort: sortOption.sort, order: sortOption.order };

    async function fetchFirstPage() {
      setLoadingMore(true);
      setCurrentPage(1);
      setHasMore(true);
      try {
        const params = {
          page: 1,
          limit: PAGE_SIZE,
          sort: sortOption.sort,
          order: sortOption.order,
        };
        const res = await request<{ data: Client[]; total: number; page: number; limit: number }>({
          url: '/clients',
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        if (!cancelled) {
          setPages([res.data]);
          setHasMore(res.data.length === PAGE_SIZE);
          dispatch({ type: 'clients/setClients', payload: res.data });
        }
      } finally {
        if (!cancelled) setLoadingMore(false);
      }
    }

    // On initial mount, use Redux cache if available and on page 1
    const reduxClients = clientsState.data || [];
    if (!isSortChanged && reduxClients.length > 0 && currentPage === 1) {
      setPages([reduxClients]);
      setHasMore(reduxClients.length === PAGE_SIZE);
      setLoadingMore(false);
      return;
    }
    // On sort change, always fetch from API
    fetchFirstPage();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOption.sort, sortOption.order, token]);

  // Ensure handleSave is declared before JSX usage
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data = await request<Client>({
        url: '/clients',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        data: form,
      });
      handleAddClient(data); // no await
    } catch (err: any) {
      setError(err?.message || 'Failed to add client');
      setSaving(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col p-6 min-h-0">
      {/* Header with search, sort, and add */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 ${allClients.length === 0 ? 'hidden' : ''}`}
      >
        <div className="flex flex-1 gap-2 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <button
              className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium border border-gray-200 flex items-center gap-1"
              onClick={() => setSortMenuOpen((v) => !v)}
              type="button"
            >
              <span>Sort: {sortOption.label}</span>
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {sortMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {CLIENT_SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 ${opt.label === sortOption.label ? 'font-semibold text-indigo-600' : ''}`}
                    onClick={() => {
                      setSortOption(opt);
                      setSortMenuOpen(false);
                      setSortToStorage(opt);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow"
            onClick={handleOpenAdd}
          >
            + Add Client
          </button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="text-3xl mb-2">👥 No clients yet</div>
          <div className="text-gray-600 mb-6 text-center">
            {search.trim()
              ? 'No clients match your search.'
              : 'Add your first client to get started.'}
          </div>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg text-lg shadow"
            onClick={handleOpenAdd}
          >
            Add Client
          </button>
        </div>
      ) : (
        <div
          ref={tableRef}
          className="overflow-x-auto overflow-y-auto bg-white rounded-xl shadow-lg mb-12"
        >
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {(filteredClients as Client[]).map((client) => (
                <ClientListItem
                  key={client._id}
                  client={client}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  onDeleteFromList={handleClientDelete}
                  onEditFromList={handleEditClient}
                />
              ))}
            </tbody>
          </table>
          {/* Sentinel for IntersectionObserver infinite scroll (debug: visible block) */}
          <div
            ref={sentinelRef}
            id="clients-sentinel"
            style={{ height: 1, background: 'transparent', width: '100%' }}
          />
          {loadingMore && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          )}
          {/* Show 'No more clients to load' only when not loadingMore and hasMore is false */}
          {!hasMore && !loadingMore && (
            <div className="text-center text-gray-400 py-2 text-xs">No more clients to load.</div>
          )}
        </div>
      )}
      {/* Add/Edit Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Client</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  name="name"
                  value={form.name || ''}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  name="contactEmail"
                  type="email"
                  value={form.contactEmail || ''}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  name="contactPhone"
                  value={form.contactPhone || ''}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes || ''}
                  onChange={handleFormChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ClientsPage;

/*
html, body, #root {
  height: 100%;
  min-height: 100%;
}
*/
