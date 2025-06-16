// src/components/driver/CourseNotification.tsx
import React from 'react';
import { FaMapMarkerAlt, FaLocationArrow, FaCheck, FaTimes } from 'react-icons/fa';

export interface CourseNotificationProps {
  pickupAddress: string;
  dropoffAddress: string;
  distance?: string;
  estimatedEarnings?: string;
  onAccept: () => void;
  onReject: () => void;
}

const CourseNotification: React.FC<CourseNotificationProps> = ({
  pickupAddress,
  dropoffAddress,
  distance = "2.5 km",
  estimatedEarnings = "2500 FCFA",
  onAccept,
  onReject
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 animate-slide-up">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-center">Nouvelle course disponible</h3>
        <p className="text-center text-gray-500 text-sm">Répondez dans 30 secondes</p>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-start">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <FaMapMarkerAlt className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Prise en charge</p>
            <p className="font-medium">{pickupAddress}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <FaLocationArrow className="text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Destination</p>
            <p className="font-medium">{dropoffAddress}</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-gray-500">Distance</p>
          <p className="font-medium">{distance}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Gain estimé</p>
          <p className="font-medium text-green-600">{estimatedEarnings}</p>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button 
          onClick={onReject}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg flex items-center justify-center"
        >
          <FaTimes className="mr-2" />
          Refuser
        </button>
        <button 
          onClick={onAccept}
          className="flex-1 bg-primary-600 text-white py-3 rounded-lg flex items-center justify-center"
        >
          <FaCheck className="mr-2" />
          Accepter
        </button>
      </div>
    </div>
  );
};

export default CourseNotification;
