import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { ArrowLeft, Printer, Download, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RideHistoryEntry } from '../../services/rideService'; // Assuming this type is exported
import { toast } from 'sonner'; // For "Download PDF" placeholder

const ClientRideReceiptPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const ride = location.state?.ride as RideHistoryEntry | undefined;

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-kole-cream-bg p-4">
        <AlertTriangle className="h-16 w-16 text-kole-destructive mb-4" />
        <h1 className="text-xl font-semibold text-kole-text-primary mb-2">{t('clientRideReceiptPage.error.noRideDataTitle', "Détails de la course non trouvés")}</h1>
        <p className="text-kole-text-secondary mb-6 text-center">{t('clientRideReceiptPage.error.noRideDataMsg', "Impossible d'afficher le reçu car les détails de la course sont manquants.")}</p>
        <Button onClick={() => navigate('/client/ride-history')} className="kole-btn-primary">
          {t('clientRideReceiptPage.buttons.backToHistory')}
        </Button>
      </div>
    );
  }

  const DetailItem: React.FC<{ labelKey: string; value?: string | number }> = ({ labelKey, value }) => (
    <div className="flex justify-between py-2 border-b border-kole-border last:border-b-0">
      <span className="text-sm text-kole-text-secondary">{t(labelKey)}</span>
      <span className="text-sm text-kole-text-primary font-medium text-right">{value || 'N/A'}</span>
    </div>
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    toast.info(t('common.featureNotAvailableYet'));
  };

  return (
    <div className="min-h-screen bg-kole-cream-bg">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center border-b border-kole-border sticky top-0 z-20 print:hidden">
        <Button variant="ghost" size="icon" className="mr-2 hover:bg-kole-hover-bg rounded-full" onClick={() => navigate('/client/ride-history')}>
          <ArrowLeft className="h-5 w-5 text-kole-text-primary" />
        </Button>
        <h1 className="text-lg font-semibold text-kole-text-primary">{t('clientRideReceiptPage.pageTitle')}</h1>
      </div>

      {/* Receipt Content */}
      <div className="p-4 max-w-2xl mx-auto">
        <Card className="kole-card border-kole-border shadow-lg">
          <CardHeader className="bg-kole-blue-primary/5 p-6">
            <CardTitle className="text-xl text-kole-blue-dark text-center">{t('clientRideReceiptPage.pageTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <DetailItem labelKey="clientRideReceiptPage.rideIdLabel" value={ride.id} />
            <DetailItem labelKey="clientRideReceiptPage.dateLabel" value={ride.date} />

            <div className="pt-3">
              <h3 className="text-md font-semibold text-kole-text-primary mb-1">{t('clientRideReceiptPage.driverLabel')}</h3>
              <DetailItem labelKey="clientDriverCard.nameLabel" value={ride.driverName} />
              {/* Assuming clientDriverCard.nameLabel or similar is used for driver name if not specific in receipt */}
              <DetailItem labelKey="clientRideReceiptPage.vehicleLabel" value={ride.vehicleInfo} />
            </div>

            <div className="pt-3">
              <h3 className="text-md font-semibold text-kole-text-primary mb-1">{t('clientRideReceiptPage.fareDetailsTitle')}</h3>
              <DetailItem labelKey="clientRideReceiptPage.pickupLabel" value={ride.pickup} />
              <DetailItem labelKey="clientRideReceiptPage.destinationLabel" value={ride.destination} />
              <DetailItem labelKey="clientRideReceiptPage.paymentMethodLabel" value={ride.paymentMethodUsed} />
              <DetailItem labelKey="clientRideReceiptPage.transactionIdLabel" value={ride.transactionId} />
              <div className="flex justify-between py-3 border-t border-kole-border mt-3">
                <span className="text-md font-bold text-kole-text-primary">{t('clientRideReceiptPage.totalPaidLabel')}</span>
                <span className="text-lg font-bold text-kole-text-primary">{ride.price}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 print:hidden">
              <Button onClick={handlePrint} className="kole-btn-primary flex-1">
                <Printer className="mr-2 h-4 w-4" />
                {t('clientRideReceiptPage.buttons.print')}
              </Button>
              <Button onClick={handleDownloadPdf} variant="outline" className="kole-btn-outline flex-1" disabled>
                <Download className="mr-2 h-4 w-4" />
                {t('clientRideReceiptPage.buttons.downloadPdf')}
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 text-center print:hidden">
            <Button variant="link" className="text-kole-blue-primary" onClick={() => navigate('/client/ride-history')}>
                {t('clientRideReceiptPage.buttons.backToHistory')}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientRideReceiptPage;
