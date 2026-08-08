import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ClipboardCheck, CheckCircle2, Clock, XCircle,
  Send, Loader2, AlertCircle, FileText, User, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import StatusTimeline from '../../components/common/StatusTimeline';
import EmptyState from '../../components/common/EmptyState';
import { getApplicationStatus, submitApplication } from '../../services/provider.service';
import { APPLICATION_STATUSES } from '../../constants';

const statusIcons = {
  draft: Clock,
  submitted: Send,
  under_review: ClipboardCheck,
  approved: CheckCircle2,
  rejected: XCircle,
  suspended: AlertCircle,
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  under_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  suspended: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

function ApplicationSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function ApplicationStatusPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['provider', 'application-status'],
    queryFn: getApplicationStatus,
  });

  const submitMutation = useMutation({
    mutationFn: submitApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider'] });
      toast.success('Application submitted successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    },
  });

  if (isLoading) return <ApplicationSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load application status"
        description="Please try again later."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  const profile = data?.data || {};
  const status = profile.applicationStatus || profile.status || 'draft';
  const statusHistory = profile.statusHistory || [];
  const completion = profile.profileCompletion ?? 0;
  const documentsCount = profile.documentsCount ?? 0;
  const StatusIcon = statusIcons[status] || Clock;
  const statusLabel = APPLICATION_STATUSES.find((s) => s.value === status)?.label || 'Draft';

  const requirements = [
    {
      label: 'Profile completion at least 60%',
      met: completion >= 60,
      icon: User,
      detail: `${completion}% complete`,
    },
    {
      label: 'At least 1 document uploaded',
      met: documentsCount > 0,
      icon: FileText,
      detail: `${documentsCount} document(s)`,
    },
    {
      label: 'Identity document verified',
      met: profile.hasVerifiedIdentity ?? false,
      icon: Shield,
      detail: profile.hasVerifiedIdentity ? 'Verified' : 'Not verified',
    },
  ];

  const canSubmit = status === 'draft' && completion >= 60 && documentsCount > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Application Status</h1>
        <p className="text-sm text-muted-foreground">
          Track the progress of your service provider application
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${statusColors[status]}`}>
              <StatusIcon className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{statusLabel}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {status === 'draft' && 'Complete your profile and upload documents to submit your application.'}
                {status === 'submitted' && 'Your application has been submitted and is waiting for review.'}
                {status === 'under_review' && 'An admin is currently reviewing your application.'}
                {status === 'approved' && 'Congratulations! Your application has been approved.'}
                {status === 'rejected' && 'Your application was not approved. Please review the feedback below.'}
                {status === 'suspended' && 'Your account has been suspended. Please contact support.'}
              </p>
            </div>
            {status === 'draft' && canSubmit && (
              <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} size="lg">
                {submitMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Submit Application</>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rejection Message */}
      {status === 'rejected' && profile.rejectionReason && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">Application Rejected</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{profile.rejectionReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Message */}
      {status === 'approved' && (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">Application Approved</h3>
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                  You are now a verified service provider on Servio. Start accepting service requests!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Requirements Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requirements Checklist</CardTitle>
            <CardDescription>Complete these requirements before submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{Math.round(completion)}%</span>
              </div>
              <Progress value={completion} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-3">
              {requirements.map((req) => {
                const Icon = req.icon;
                return (
                  <div key={req.label} className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${req.met ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      {req.met ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${req.met ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                        {req.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{req.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Application Timeline</CardTitle>
            <CardDescription>History of your application status changes</CardDescription>
          </CardHeader>
          <CardContent>
            {statusHistory.length > 0 ? (
              <StatusTimeline history={[...statusHistory].reverse()} />
            ) : (
              <EmptyState
                icon={ClipboardCheck}
                title="No history yet"
                description="Your application timeline will appear here after submission."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
