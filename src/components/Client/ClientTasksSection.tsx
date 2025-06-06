import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { request } from '../../services/request';
import PaginatedEntityList from '../common/PaginatedEntityList';
import EntityModal, { EntityModalField } from '../common/EntityModal';
import EntitySearchBar from '../common/EntitySearchBar';
import EntitySortMenu from '../common/EntitySortMenu';
import ActionMenu from '../common/ActionMenu';
import Button from '../common/Button';

interface Task {
  _id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

const TASK_SORT_OPTIONS = [
  { label: 'Date Created (Newest)', value: 'createdAt:desc' },
  { label: 'Date Created (Oldest)', value: 'createdAt:asc' },
  { label: 'Due Date (Soonest)', value: 'dueDate:asc' },
  { label: 'Due Date (Latest)', value: 'dueDate:desc' },
  { label: 'Name (A-Z)', value: 'name:asc' },
  { label: 'Name (Z-A)', value: 'name:desc' },
];

// Helper to get today's date in local time as 'YYYY-MM-DD'
const getToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const taskFields: EntityModalField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Completed', value: 'completed' },
      { label: 'Archived', value: 'archived' },
    ],
  },
  { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
];

const PAGE_SIZE = 10;

// Helper to format date as '16 Jun'
const formatShortDate = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.toLocaleString('default', { month: 'short' });
  return `${day} ${month.charAt(0).toUpperCase() + month.slice(1, 3)}`;
};

// Helper to get due date background color
const getDueDateBg = (dateStr: string) => {
  if (!dateStr) return 'bg-gray-100';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return 'bg-red-100 text-red-800';
  if (d.getTime() > today.getTime() + 24 * 60 * 60 * 1000) return 'bg-gray-100 text-gray-800';
  if (d.getTime() > today.getTime()) return 'bg-gray-100 text-gray-800';
  // Past due
  return 'bg-red-50 text-red-500';
};

// Helper to get status background color
const getStatusBg = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'archived':
      return 'bg-gray-200 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface ClientTasksSectionProps {
  clientId: string;
}

const ClientTasksSection: React.FC<ClientTasksSectionProps> = ({ clientId }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(TASK_SORT_OPTIONS[0].value);
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);
  const statusButtonRefs = useRef<{ [id: string]: HTMLButtonElement | null }>({});

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = sort.split(':');
      const params: any = {
        clientId,
        page,
        limit: PAGE_SIZE,
        sort: sortField,
        order: sortOrder,
        search: search.trim() || undefined,
      };
      const res = await request<{ data: Task[]; total: number }>({
        url: '/tasks',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setTasks(res.data);
      setTotal(res.total);
    } catch (err) {
      setTasks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [clientId, page, sort, search, token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAdd = () => {
    setModalTask(null);
    setShowModal(true);
  };

  const handleEdit = (task: Task) => {
    setModalTask(task);
    setShowModal(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    setLoading(true);
    try {
      await request({
        url: `/tasks/${taskId}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async (data: any) => {
    setModalSaving(true);
    try {
      if (modalTask) {
        // Edit
        await request({
          url: `/tasks/${modalTask._id}`,
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          data: { ...data, clientId },
        });
      } else {
        // Add
        await request({
          url: '/tasks',
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          data: { ...data, clientId },
        });
      }
      setShowModal(false);
      fetchTasks();
    } finally {
      setModalSaving(false);
    }
  };

  // Inline due date update
  const handleDueDateUpdate = async (task: Task, newDate: string) => {
    if (task.dueDate.slice(0, 10) === newDate) return;
    try {
      await request({
        url: `/tasks/${task._id}`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        data: { dueDate: newDate },
      });
      // Optimistically update local state
      setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, dueDate: newDate } : t)));
    } finally {
      setStatusMenuId(null);
      // Optionally: fetchTasks(); // for background sync
    }
  };

  // Inline status update
  const handleStatusUpdate = async (task: Task, newStatus: Task['status']) => {
    if (task.status === newStatus) return;
    try {
      await request({
        url: `/tasks/${task._id}`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        data: { status: newStatus },
      });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t)));
    } finally {
      setStatusMenuId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div className="flex-1 flex gap-1 items-center min-w-0">
          <EntitySearchBar
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search tasks by name..."
          />
          <EntitySortMenu
            options={TASK_SORT_OPTIONS}
            value={sort}
            onChange={(v) => {
              setSort(v);
              setPage(1);
            }}
            label="Sort"
            className="text-xs px-2 py-1 h-8 min-h-0 whitespace-nowrap"
            showLabel={false}
          />
        </div>
        <Button
          color="primary"
          onClick={handleAdd}
          className="px-2 py-1 text-xs font-semibold shadow"
        >
          + Add Task
        </Button>
      </div>
      <PaginatedEntityList
        items={tasks}
        columns={[
          { label: 'Name', className: 'w-1/4' },
          { label: 'Status', className: 'w-1/4 text-center' },
          { label: 'Due Date', className: 'w-1/4 text-center' },
          { label: 'Actions', className: 'w-1/4 text-right' },
        ]}
        renderItem={(task: Task) => [
          // Name
          <span className="font-medium text-gray-900 truncate overflow-hidden max-w-[10rem]">
            {task.name}
          </span>,
          // Status
          <div className="relative inline-block w-full">
            <button
              ref={(ref) => {
                statusButtonRefs.current[task._id] = ref;
                // If menu should be open but ref was just set, force a re-render to ensure anchorRef is available
                if (ref && statusMenuId === task._id && !ref.dataset.statusMenuRendered) {
                  ref.dataset.statusMenuRendered = 'true';
                  setTimeout(() => setStatusMenuId(task._id), 0);
                }
              }}
              className={`inline-block min-w-[80px] rounded px-2 py-1 text-xs font-semibold shadow-sm focus:outline-none ${getStatusBg(task.status)}`}
              onClick={(e) => {
                e.stopPropagation();
                setStatusMenuId(statusMenuId === task._id ? null : task._id);
              }}
              aria-label="Change status"
              type="button"
              style={{ zIndex: 100 }}
            >
              {(() => {
                switch (task.status) {
                  case 'active':
                    return 'Active';
                  case 'completed':
                    return 'Completed';
                  case 'archived':
                    return 'Archived';
                  default:
                    return task.status;
                }
              })()}
            </button>
            {/* Render ActionMenu only if anchorRef is available and menu is open */}
            {statusMenuId === task._id && statusButtonRefs.current[task._id] && (
              <ActionMenu
                open={statusMenuId === task._id}
                anchorRef={{ current: statusButtonRefs.current[task._id] }}
                onClose={() => setStatusMenuId(null)}
                items={[
                  { label: 'Active', onClick: () => handleStatusUpdate(task, 'active') },
                  { label: 'Completed', onClick: () => handleStatusUpdate(task, 'completed') },
                  { label: 'Archived', onClick: () => handleStatusUpdate(task, 'archived') },
                ]}
                className="z-[100]"
              />
            )}
          </div>,
          // Due Date
          <div className="relative w-full flex justify-center">
            <button
              type="button"
              className={`appearance-none inline-flex items-center justify-center gap-1 min-w-[80px] rounded px-2 py-1 text-xs font-semibold shadow-sm focus:outline-none cursor-pointer ${getDueDateBg(task.dueDate)}`}
              style={{ maxWidth: 120, position: 'relative' }}
              onClick={(e) => {
                e.stopPropagation();
                // Focus the hidden input to open the calendar
                const input = document.getElementById(`date-input-${task._id}`) as HTMLInputElement;
                if (input) input.showPicker ? input.showPicker() : input.focus();
              }}
              tabIndex={0}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                style={{ color: 'inherit' }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" className="" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className="text-xs font-semibold text-gray-900">
                {formatShortDate(task.dueDate)}
              </span>
              <input
                id={`date-input-${task._id}`}
                type="date"
                className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
                value={task.dueDate.slice(0, 10)}
                min={getToday()}
                onChange={(e) => handleDueDateUpdate(task, e.target.value || getToday())}
                aria-label="Change due date"
                required
                tabIndex={-1}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' || e.key === 'Delete') {
                    e.preventDefault();
                  }
                }}
                onBlur={(e) => {
                  if (!e.target.value) {
                    handleDueDateUpdate(task, getToday());
                  }
                }}
                style={{ pointerEvents: 'auto' }}
              />
            </button>
          </div>,
          // Actions
          <div className="flex justify-end gap-2">
            <Button
              color="secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(task);
              }}
              className="px-3 py-1.5 text-sm font-semibold shadow-sm"
            >
              Edit
            </Button>
            <Button
              color="danger"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(task._id);
              }}
              className="px-3 py-1.5 text-sm font-semibold shadow-sm"
            >
              Delete
            </Button>
          </div>,
        ]}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        loading={loading}
        emptyText="No tasks found."
      />
      {showModal && (
        <EntityModal
          title={modalTask ? 'Edit Task' : 'Add Task'}
          fields={taskFields}
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
          initialData={
            modalTask
              ? {
                  name: modalTask.name,
                  description: modalTask.description,
                  status: modalTask.status,
                  dueDate: modalTask.dueDate.slice(0, 10),
                }
              : undefined
          }
          loading={modalSaving}
        />
      )}
    </div>
  );
};

export default ClientTasksSection;
