// src/pages/driver/DriverCoursesPage.tsx
import React, { useState } from 'react';
import CourseCard from '../../components/driver/CourseCard';
import '../../styles/theme.css';

// Données fictives pour la démonstration
const coursesData = [
  {
    id: '1',
    date: '17 mai 2025',
    time: '14:30',
    pickupAddress: 'Plateau, Avenue de la République',
    dropoffAddress: 'Cocody, Rue des Jardins',
    amount: '1500 FCFA',
    status: 'completed' as const
  },
  {
    id: '2',
    date: '16 mai 2025',
    time: '10:15',
    pickupAddress: 'Marcory, Boulevard Valéry Giscard d\'Estaing',
    dropoffAddress: 'Treichville, Avenue 21',
    amount: '2200 FCFA',
    status: 'completed' as const
  },
  {
    id: '3',
    date: '15 mai 2025',
    time: '18:45',
    pickupAddress: 'Yopougon, Rue des Princes',
    dropoffAddress: 'Adjamé, Gare Routière',
    amount: '1800 FCFA',
    status: 'completed' as const
  },
  {
    id: '4',
    date: '14 mai 2025',
    time: '09:20',
    pickupAddress: 'Port-Bouët, Boulevard de l\'Aéroport',
    dropoffAddress: 'Koumassi, Carrefour Akwaba',
    amount: '2500 FCFA',
    status: 'completed' as const
  },
  {
    id: '5',
    date: '13 mai 2025',
    time: '16:10',
    pickupAddress: 'Bingerville, Quartier Résidentiel',
    dropoffAddress: 'Plateau, Immeuble CCIA',
    amount: '3000 FCFA',
    status: 'completed' as const
  }
];

const DriverCoursesPage: React.FC = () => {
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  
  // Calculer les gains totaux
  const totalEarnings = coursesData.reduce((total, course) => {
    const amount = parseInt(course.amount.replace(' FCFA', '').replace(' ', ''));
    return total + amount;
  }, 0);
  
  // Filtrer les courses selon le filtre actif
  const filteredCourses = coursesData.filter(course => {
    if (filter === 'all') return true;
    
    const courseDate = new Date(course.date.split(' ').reverse().join('-'));
    const today = new Date();
    
    if (filter === 'today') {
      return courseDate.toDateString() === today.toDateString();
    } else if (filter === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return courseDate >= weekStart;
    } else if (filter === 'month') {
      return courseDate.getMonth() === today.getMonth() && 
             courseDate.getFullYear() === today.getFullYear();
    }
    
    return true;
  });

  return (
    <div className="app-container">
      <div className="page-container">
        <div className="header-container p-4">
          <h2 className="text-[#333333] font-semibold text-2xl mb-4">Mes Courses</h2>
          
          {/* Résumé des gains */}
          <div className="bg-white rounded-lg p-4 shadow-sm mb-4 border-l-4 border-[#0D6EFD]">
            <p className="text-[#666666] text-sm">Gains totaux</p>
            <p className="text-[#28A745] font-bold text-xl">{totalEarnings} FCFA</p>
          </div>
        </div>
        
        {/* Filtres */}
        <div className="bg-white flex w-full shadow-sm overflow-hidden sticky top-0 z-10">
          <button 
            className={`flex-1 py-3 text-center font-medium ${filter === 'all' ? 'bg-[#0D6EFD] text-white' : 'text-[#666666]'}`}
            onClick={() => setFilter('all')}
          >
            Toutes
          </button>
          <button 
            className={`flex-1 py-3 text-center font-medium ${filter === 'today' ? 'bg-[#0D6EFD] text-white' : 'text-[#666666]'}`}
            onClick={() => setFilter('today')}
          >
            Aujourd'hui
          </button>
          <button 
            className={`flex-1 py-3 text-center font-medium ${filter === 'week' ? 'bg-[#0D6EFD] text-white' : 'text-[#666666]'}`}
            onClick={() => setFilter('week')}
          >
            Semaine
          </button>
          <button 
            className={`flex-1 py-3 text-center font-medium ${filter === 'month' ? 'bg-[#0D6EFD] text-white' : 'text-[#666666]'}`}
            onClick={() => setFilter('month')}
          >
            Mois
          </button>
        </div>
        
        {/* Liste des courses */}
        <div className="content-container list-container p-4">
          <div className="space-y-4 w-full">
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => (
                <CourseCard 
                  key={course.id}
                  date={course.date}
                  time={course.time}
                  pickupAddress={course.pickupAddress}
                  dropoffAddress={course.dropoffAddress}
                  amount={course.amount}
                  status={course.status}
                />
              ))
            ) : (
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="text-[#666666] text-4xl mb-3">🔍</div>
                <p className="text-[#333333] font-medium">Aucune course trouvée</p>
                <p className="text-[#666666] text-sm">
                  Aucune course ne correspond à ce filtre pour le moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverCoursesPage;
