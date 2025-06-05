import React from 'react';
import Button from './Button';

export interface PaginatedEntityListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  emptyText?: string;
}

function PaginatedEntityList<T>({
  items,
  renderItem,
  page,
  pageSize,
  total,
  onPageChange,
  loading = false,
  emptyText = 'No items found.',
}: PaginatedEntityListProps<T>) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-gray-400">{emptyText}</div>
      ) : (
        // Render as a table for proper width and alignment
        <div className="overflow-x-auto overflow-y-auto bg-white rounded-xl shadow-lg mb-12">
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
              {items.map((item, i) => renderItem(item))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex gap-2 mt-4 justify-end">
        <Button
          className="px-2 py-1 rounded bg-gray-100"
          color="secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          Prev
        </Button>
        <span className="px-2">
          Page {page} of {totalPages}
        </span>
        <Button
          className="px-2 py-1 rounded bg-gray-100"
          color="secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default PaginatedEntityList;
