import React from 'react';

interface AvatarProps {
  name: string;
  size?: number; // px
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, size = 48, className = '' }) => {
  const initial = name?.[0]?.toUpperCase() || 'C';
  return (
    <div
      className={`rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 ${className}`}
      style={{ width: size, height: size, fontSize: size / 2 }}
      aria-label={name}
    >
      {initial}
    </div>
  );
};

export default Avatar;
