import React from 'react';
import { Card, CardContent } from "@/components/ui/card"; // Assuming this path is correct from a page context
import { useTranslation } from 'react-i18next';

interface RideInfoCardProps {
  pickupAddress: string;
  destinationAddress: string;
  price: string | number;
  estimatedTime: string;
}

const RideInfoCard: React.FC<RideInfoCardProps> = ({
  pickupAddress,
  destinationAddress,
  price,
  estimatedTime,
}) => {
  const { t } = useTranslation();

  return (
    <Card className="kole-card bg-white rounded-xl-kole border-kole-border w-full">
      <CardContent className="p-4">
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-xs text-kole-text-secondary uppercase tracking-wider">{t('rideInfoCard.fromLabel')}</p>
            <p className="font-medium text-kole-text-primary truncate" title={pickupAddress}>{pickupAddress}</p>
          </div>
          <div className="text-right pl-2">
            <p className="text-xs text-kole-text-secondary uppercase tracking-wider">{t('rideInfoCard.toLabel')}</p>
            <p className="font-medium text-kole-text-primary truncate" title={destinationAddress}>{destinationAddress}</p>
          </div>
        </div>
        <div className="flex justify-between items-end"> {/* Added items-end for better alignment if text wraps */}
          <div>
            <p className="text-xs text-kole-text-secondary uppercase tracking-wider">{t('rideInfoCard.priceLabel')}</p>
            <p className="font-bold text-kole-text-primary text-lg">
              {typeof price === 'number' ? t('rideInfoCard.priceFormat', { price }) : price}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-kole-text-secondary uppercase tracking-wider">{t('rideInfoCard.durationLabel')}</p>
            <p className="font-medium text-kole-text-primary text-lg">{estimatedTime}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RideInfoCard;
