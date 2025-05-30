import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface ClientActionsMenuProps {
  open: boolean;
  onClose: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}

const ClientActionsMenu: React.FC<ClientActionsMenuProps> = ({
  open,
  onClose,
  onView,
  onEdit,
  onDelete,
  anchorRef,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      // Position menu below the button, right-aligned
      setPosition({
        top: rect.bottom + window.scrollY + 4, // 4px gap
        left: rect.right + window.scrollX - 200, // 200px = menu width (w-48)
      });
    }
  }, [open, anchorRef]);

  if (!open || !position) return null;

  const menu = (
    <div
      ref={menuRef}
      className="absolute w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <button
        className="block w-full text-left px-3 py-2 text-base text-gray-700 hover:bg-gray-100 flex items-center gap-3"
        onClick={() => {
          onView();
          onClose();
        }}
      >
        {/* Heroicons Eye (Outline) - more complete eye */}
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
        View
      </button>
      <button
        className="block w-full text-left px-3 py-2 text-base text-gray-700 hover:bg-gray-100 flex items-center gap-3"
        onClick={() => {
          onEdit();
          onClose();
        }}
      >
        {/* Heroicons Pencil Square (Outline) - straight pencil */}
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
        Edit
      </button>
      <button
        className="block w-full text-left px-3 py-2 text-base text-red-600 hover:bg-red-50 flex items-center gap-3"
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
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
        Delete
      </button>
    </div>
  );

  return ReactDOM.createPortal(menu, document.body);
};

export default ClientActionsMenu;
