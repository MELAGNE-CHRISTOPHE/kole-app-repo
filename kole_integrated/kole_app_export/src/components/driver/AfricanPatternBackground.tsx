// src/components/driver/AfricanPatternBackground.tsx
import React, { ReactNode } from 'react';
import '../../styles/theme.css';

interface AfricanPatternBackgroundProps {
  children: ReactNode;
  opacity?: number;
}

const AfricanPatternBackground: React.FC<AfricanPatternBackgroundProps> = ({ 
  children, 
  opacity = 0.03 
}) => {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Pattern de fond */}
      <div 
        className="pattern-background"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234a2e1f' fill-opacity='${opacity}'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 1
        }}
      />
      
      {/* Contenu */}
      <div className="relative h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default AfricanPatternBackground;
