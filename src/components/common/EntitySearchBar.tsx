import React from 'react';

interface EntitySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const EntitySearchBar: React.FC<EntitySearchBarProps> = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    placeholder={placeholder || 'Search...'}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
  />
);

export default EntitySearchBar;
