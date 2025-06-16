// src/components/driver/TransactionCard.tsx
import React from 'react';
import { FaArrowUp, FaArrowDown, FaPercentage, FaClock } from 'react-icons/fa';

interface TransactionCardProps {
  date: string;
  time: string;
  type: 'earning' | 'withdrawal' | 'commission';
  description: string;
  amount: string;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  date,
  time,
  type,
  description,
  amount
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'earning':
        return <FaArrowDown className="text-[#28A745]" />;
      case 'withdrawal':
        return <FaArrowUp className="text-[#DC3545]" />;
      case 'commission':
        return <FaPercentage className="text-[#FFC107]" />;
      default:
        return null;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'earning':
        return 'text-[#28A745]';
      case 'withdrawal':
        return 'text-[#DC3545]';
      case 'commission':
        return 'text-[#FFC107]';
      default:
        return '';
    }
  };

  const getTypeBorder = () => {
    switch (type) {
      case 'earning':
        return 'border-[#28A745]';
      case 'withdrawal':
        return 'border-[#DC3545]';
      case 'commission':
        return 'border-[#FFC107]';
      default:
        return '';
    }
  };

  const getTypeText = () => {
    switch (type) {
      case 'earning':
        return 'Gain';
      case 'withdrawal':
        return 'Retrait';
      case 'commission':
        return 'Commission';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden border-l-4 ${getTypeBorder()}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <FaClock className="text-[#666666] mr-2" />
            <span className="text-[#666666] text-sm">{date} • {time}</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            type === 'earning' ? 'bg-[#E8F5E9] text-[#28A745]' : 
            type === 'withdrawal' ? 'bg-[#FFEBEE] text-[#DC3545]' : 
            'bg-[#FFF8E1] text-[#FFC107]'
          }`}>
            {getTypeText()}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-[#333333]">{description}</p>
          <div className="flex items-center">
            {getTypeIcon()}
            <span className={`ml-2 font-semibold ${getTypeColor()}`}>{amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
