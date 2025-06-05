import React, { useRef } from 'react';
import ActionMenu from './ActionMenu';
import Button from './Button';

interface EntitySortMenuOption {
  label: string;
  value: string;
}

interface EntitySortMenuProps {
  options: EntitySortMenuOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const EntitySortMenu: React.FC<EntitySortMenuProps> = ({ options, value, onChange, label }) => {
  const [open, setOpen] = React.useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium border border-gray-200 flex items-center gap-1"
        color="secondary"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>Sort: {selected ? selected.label : label}</span>
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </Button>
      <ActionMenu
        open={open}
        anchorRef={buttonRef}
        onClose={() => setOpen(false)}
        items={options.map((opt) => ({
          label: opt.label,
          onClick: () => {
            onChange(opt.value);
            setOpen(false);
          },
          danger: false,
        }))}
        className="right-0 mt-2"
      />
    </div>
  );
};

export default EntitySortMenu;
