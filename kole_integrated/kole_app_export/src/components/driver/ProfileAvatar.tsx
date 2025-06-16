// src/components/driver/ProfileAvatar.tsx
import React from 'react';
import './ProfileAvatar.css';

export interface ProfileAvatarProps {
  photoURL?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ photoURL, name, size = 'md' }) => {
  // Obtenir les initiales du nom
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const initials = getInitials(name);
  
  return (
    <div className={`profile-avatar ${size}`}>
      {photoURL ? (
        <img src={photoURL} alt={name} className="avatar-image" />
      ) : (
        <div className="avatar-placeholder">
          {initials}
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
