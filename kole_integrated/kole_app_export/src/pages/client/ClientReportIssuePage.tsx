import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RideHistoryEntry, reportRideIssue } from '../../services/rideService';
import { toast } from 'sonner';

const issueCategories = [
  "issueCategories.driverBehavior",
  "issueCategories.vehicleCondition",
  "issueCategories.routeTaken",
  "issueCategories.billingError",
  "issueCategories.lostItem",
  "issueCategories.other",
];

const ClientReportIssuePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const ride = location.state?.ride as RideHistoryEntry | undefined;

  const reportIssueSchema = z.object({
    categoryKey: z.string().min(1, { message: t('clientReportIssuePage.validation.categoryRequired') }),
    description: z.string().min(10, { message: t('clientReportIssuePage.validation.descriptionRequired') }),
    // Min 10 for description, adjust as needed
  });
  type ReportIssueFormData = z.infer<typeof reportIssueSchema>;

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ReportIssueFormData>({
    resolver: zodResolver(reportIssueSchema),
    defaultValues: {
      categoryKey: '',
      description: '',
    }
  });

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-kole-cream-bg p-4">
        <AlertTriangle className="h-16 w-16 text-kole-destructive mb-4" />
        <h1 className="text-xl font-semibold text-kole-text-primary mb-2">
          {t('clientReportIssuePage.error.noRideDataTitle', "Détails de la course non trouvés")}
        </h1>
        <p className="text-kole-text-secondary mb-6 text-center">
          {t('clientReportIssuePage.error.noRideDataMsg', "Impossible de signaler un problème car les détails de la course sont manquants.")}
        </p>
        <Button onClick={() => navigate('/client/ride-history')} className="kole-btn-primary">
          {t('clientRideReceiptPage.buttons.backToHistory', "Retour à l'historique")}
        </Button>
      </div>
    );
  }

  const onSubmitRHF: SubmitHandler<ReportIssueFormData> = async (data) => {
    const toastId = toast.loading(t('clientReportIssuePage.buttons.submittingReport'));
    try {
      const result = await reportRideIssue({
        rideId: ride.id,
        categoryKey: data.categoryKey,
        description: data.description,
      });

      toast.dismiss(toastId);
      if (result.error) {
        toast.error(t(result.error.messageKey || 'rideService.errors.reportIssueFailed'));
      } else if (result.data?.success) {
        toast.success(t(result.data.messageKey || 'rideService.success.issueReported', { reportId: result.data.reportId }));
        navigate('/client/ride-history');
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(t('rideService.errors.reportIssueFailed'));
      console.error("Unexpected error reporting issue:", error);
    }
  };

  // Re-import SubmitHandler as it's used in onSubmitRHF
  type SubmitHandler<T> = (data: T) => void | Promise<void>;


  return (
    <div className="min-h-screen bg-kole-cream-bg">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center border-b border-kole-border sticky top-0 z-20">
        <Button variant="ghost" size="icon" className="mr-2 hover:bg-kole-hover-bg rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5 text-kole-text-primary" />
        </Button>
        <h1 className="text-lg font-semibold text-kole-text-primary">{t('clientReportIssuePage.pageTitle')}</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <Card className="kole-card border-kole-border shadow-lg">
          <CardHeader className="p-6">
            <CardTitle className="text-lg text-kole-text-primary">
              {t('clientReportIssuePage.rideContextTitle', { driverName: ride.driverName, date: ride.date })}
            </CardTitle>
            <p className="text-sm text-kole-text-secondary">
              {t('clientReportIssuePage.rideDetails', { pickup: ride.pickup, destination: ride.destination })}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmitRHF)} className="space-y-6">
              <div>
                <label htmlFor="categoryKey" className="block text-sm font-medium text-kole-text-primary mb-1">
                  {t('clientReportIssuePage.issueCategoryLabel')}
                </label>
                <Controller
                  name="categoryKey"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="categoryKey" className="kole-input">
                        <SelectValue placeholder={t('issueCategories.selectPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="kole-card">
                        {issueCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {t(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryKey && <p className="text-xs text-red-500 mt-1">{errors.categoryKey.message}</p>}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-kole-text-primary mb-1">
                  {t('clientReportIssuePage.descriptionLabel')}
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="description"
                      placeholder={t('clientReportIssuePage.descriptionPlaceholder')}
                      className="kole-input min-h-[120px]"
                      {...field}
                    />
                  )}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              <Button type="submit" className="w-full kole-btn-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t(isSubmitting ? 'clientReportIssuePage.buttons.submittingReport' : 'clientReportIssuePage.buttons.submitReport')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientReportIssuePage;
