// src/components/driver/StatusToggle.tsx
import React from 'react';

interface StatusToggleProps {
  isOnline: boolean;
  onToggle: () => void;
}

const StatusToggle: React.FC<StatusToggleProps> = ({ isOnline, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`w-full py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-300 ${
        isOnline 
          ? 'bg-[#28A745] text-white' 
          : 'bg-[#6C757D] text-white'
      }`}
    >
      <span className="relative flex h-3 w-3 mr-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-white' : 'bg-gray-300'} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-white' : 'bg-gray-300'}`}></span>
      </span>
      {isOnline ? 'En ligne' : 'Hors ligne'}
    </button>
  );
};

export default StatusToggle;
