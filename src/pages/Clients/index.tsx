import React, { useState, useRef, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { request } from '../../services/request';
import { ClientListItem } from '../../components/Client';
import { CLIENT_SORT_OPTIONS } from '../../constants/clientSortOptions';
import EntityModal, { EntityModalField } from '../../components/common/EntityModal';
import PaginatedEntityList from '../../components/common/PaginatedEntityList';
import EntitySearchBar from '../../components/common/EntitySearchBar';
import EntitySortMenu from '../../components/common/EntitySortMenu';
import Button from '../../components/common/Button';
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
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState(() => getSortFromStorage());
  const [pages, setPages] = useState<Client[][]>([]); // each page is an array
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const dispatch = useDispatch();
  const tableRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null); // For IntersectionObserver

  const handleOpenAdd = () => {
    setShowAddModal(true);
  };

  const handleAddClient = async (client: Client) => {
    // Set sort to Date Added (Newest) and persist
    const newestSort = CLIENT_SORT_OPTIONS.find((opt) => opt.label === 'Date Added (Newest)');
    if (newestSort) {
      setSortOption(newestSort);
      setSortToStorage(newestSort);
    }
    setSaving(true);
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
      console.error(err);
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

  // Map CLIENT_SORT_OPTIONS to generic format
  const genericSortOptions = CLIENT_SORT_OPTIONS.map((opt) => ({
    label: opt.label,
    value: `${opt.sort}:${opt.order}`,
  }));

  // Helper to get sort and order from value
  function parseSortValue(value: string) {
    const [sort, order] = value.split(':');
    return { sort, order };
  }

  // Define fields for the generic modal
  const clientFields: EntityModalField[] = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'contactEmail', label: 'Email', type: 'email' },
    { name: 'contactPhone', label: 'Phone', type: 'text' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ];

  return (
    <main className="flex-1 flex flex-col p-6 min-h-0">
      {/* Header with search, sort, and add */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 ${allClients.length === 0 ? 'hidden' : ''}`}
      >
        <div className="flex flex-1 gap-2 items-center">
          <div className="flex-1">
            <EntitySearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search clients by name or email..."
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <EntitySortMenu
            options={genericSortOptions}
            value={`${sortOption.sort}:${sortOption.order}`}
            onChange={(val) => {
              const { sort, order } = parseSortValue(val);
              const opt = CLIENT_SORT_OPTIONS.find((o) => o.sort === sort && o.order === order);
              if (opt) setSortOption(opt);
              setSortToStorage(opt!);
            }}
            label="Sort"
          />
          <Button
            color="primary"
            className="px-4 py-2 rounded-lg font-semibold shadow"
            onClick={handleOpenAdd}
          >
            + Add Client
          </Button>
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
          <Button
            color="primary"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg text-lg shadow"
            onClick={handleOpenAdd}
          >
            Add Client
          </Button>
        </div>
      ) : (
        // Replace table/list with PaginatedEntityList
        allClients.length > 0 && (
          <PaginatedEntityList
            items={filteredClients}
            renderItem={(client) => (
              <ClientListItem
                key={client._id}
                client={client}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                onDeleteFromList={handleClientDelete}
                onEditFromList={handleEditClient}
              />
            )}
            page={currentPage}
            pageSize={PAGE_SIZE}
            total={allClients.length}
            onPageChange={setCurrentPage}
            loading={loading}
            emptyText="No clients found."
          />
        )
      )}
      {/* Add/Edit Client Modal */}
      {showAddModal && (
        <EntityModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={async (data) => {
            setSaving(true);
            try {
              const res = await request({
                url: '/clients',
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                data,
              });
              handleAddClient(res);
            } catch (err: any) {
              console.error(err);
            } finally {
              setSaving(false);
              setShowAddModal(false);
            }
          }}
          fields={clientFields}
          initialData={{}}
          title="Add Client"
          submitLabel="Save"
          loading={saving}
        />
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
