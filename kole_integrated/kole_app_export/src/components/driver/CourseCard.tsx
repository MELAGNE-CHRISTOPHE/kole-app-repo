// src/components/driver/CourseCard.tsx
import React from 'react';
import { FaMapMarkerAlt, FaMapPin, FaMoneyBillWave, FaClock } from 'react-icons/fa';

interface CourseCardProps {
  date: string;
  time: string;
  pickupAddress: string;
  dropoffAddress: string;
  amount: string;
  status: 'completed' | 'cancelled' | 'in_progress';
}

const CourseCard: React.FC<CourseCardProps> = ({
  date,
  time,
  pickupAddress,
  dropoffAddress,
  amount,
  status
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'border-[#28A745]';
      case 'cancelled':
        return 'border-[#DC3545]';
      case 'in_progress':
        return 'border-[#FFC107]';
      default:
        return 'border-[#0D6EFD]';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      case 'in_progress':
        return 'En cours';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden border-l-4 ${getStatusColor()}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <FaClock className="text-[#666666] mr-2" />
            <span className="text-[#666666]">{date} • {time}</span>
          </div>
          {status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === 'completed' ? 'bg-[#E8F5E9] text-[#28A745]' : 
              status === 'cancelled' ? 'bg-[#FFEBEE] text-[#DC3545]' : 
              'bg-[#FFF8E1] text-[#FFC107]'
            }`}>
              {getStatusText()}
            </span>
          )}
        </div>
        
        <div className="space-y-3 mb-3">
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-[#0D6EFD] mt-1 mr-2 flex-shrink-0" />
            <div>
              <p className="text-[#666666] text-sm">Prise en charge</p>
              <p className="text-[#333333]">{pickupAddress}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <FaMapPin className="text-[#28A745] mt-1 mr-2 flex-shrink-0" />
            <div>
              <p className="text-[#666666] text-sm">Destination</p>
              <p className="text-[#333333]">{dropoffAddress}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <div className="flex items-center">
            <FaMoneyBillWave className="text-[#28A745] mr-2" />
            <span className="text-[#28A745] font-semibold">{amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
