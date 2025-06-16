import React from 'react';

const SearchingAnimation: React.FC = () => {
  return (
    <div className="relative flex justify-center items-center w-64 h-64">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute border-4 border-kole-blue rounded-full animate-ping-slow opacity-75"
          style={{
            width: `${(i + 1) * 4}rem`, // 64px, 128px, 192px
            height: `${(i + 1) * 4}rem`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: '2s',
          }}
        ></div>
      ))}
      {/* Vous pouvez ajouter une icône de voiture/moto au centre si désiré */}
      {/* <Bike className="w-12 h-12 text-kole-blue" /> */}
    </div>
  );
};

export default SearchingAnimation;

// Ajout de l'animation ping-slow dans le CSS global ou via un plugin Tailwind si nécessaire.
// Pour l'instant, on peut le définir dans le fichier CSS global (par exemple, src/index.css)
/*
@keyframes ping-slow {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
*/

