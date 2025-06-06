import React from 'react';
import ReactDOM from 'react-dom';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface ActionMenuProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  items: ActionMenuItem[];
  onClose: () => void;
  className?: string;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  open,
  anchorRef,
  items,
  onClose,
  className = '',
}) => {
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [open, anchorRef]);

  if (!open || !position) return null;

  const menu = (
    <div
      ref={menuRef}
      className={`fixed w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] animate-fade-in ${className}`}
      style={{ top: position.top, left: position.left }}
    >
      {items.map((item, idx) => (
        <button
          key={item.label}
          className={`block w-full text-left px-3 py-2 text-base flex items-center gap-3 ${item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );

  return ReactDOM.createPortal(menu, document.body);
};

export default ActionMenu;
