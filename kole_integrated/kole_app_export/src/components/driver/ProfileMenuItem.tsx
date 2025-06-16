// src/components/driver/ProfileMenuItem.tsx
import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  isLast?: boolean;
  showChevron?: boolean;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ 
  icon, 
  title, 
  onPress, 
  isLast = false,
  showChevron = true
}) => {
  return (
    <div 
      className={`flex items-center justify-between p-4 ${!isLast ? 'border-b border-[#EEEEEE]' : ''} cursor-pointer hover:bg-[#F9F9F9]`}
      onClick={onPress}
    >
      <div className="flex items-center">
        <div className="mr-4 text-xl">
          {icon}
        </div>
        <span className="text-[#333333] font-medium">{title}</span>
      </div>
      {showChevron && (
        <FaChevronRight className="text-[#AAAAAA]" />
      )}
    </div>
  );
};

export default ProfileMenuItem;
