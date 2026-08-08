import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  FileText,
  ClipboardCheck,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import StatsCard from '../../components/common/StatsCard';
import StatusTimeline from '../../components/common/StatusTimeline';
import EmptyState from '../../components/common/EmptyState';
import { getDashboardStats, getApplicationStatus } from '../../services/provider.service';
import { formatDate } from '../../utils/helpers';
import { APPLICATION_STATUSES } from '../../constants';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ['provider', 'dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const {
    data: applicationData,
    isLoading: appLoading,
  } = useQuery({
    queryKey: ['provider', 'application-status'],
    queryFn: getApplicationStatus,
  });

  const isLoading = statsLoading || appLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (statsError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load dashboard"
        description="We could not retrieve your dashboard data. Please try again later."
        action={
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        }
      />
    );
  }

  const stats = statsData?.data || {};
  const profile = applicationData?.data?.profile || applicationData?.data || {};
  const statusHistory = profile.statusHistory || [];
  const recentHistory = statusHistory.slice(-5).reverse();

  const profileCompletion =
    stats.profile?.profileCompletion ?? profile.profileCompletion ?? 0;
  const documentsCount = Array.isArray(stats.documents) ? stats.documents.length : 0;
  const applicationStatus = profile.applicationStatus || profile.status || 'draft';
  const createdAt = profile.createdAt || user?.createdAt;
  const daysSinceRegistration = createdAt
    ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const statusInfo = APPLICATION_STATUSES.find((s) => s.value === applicationStatus) || {
    label: 'Draft',
    color: 'gray',
  };

  const badgeVariantMap = {
    gray: 'secondary',
    yellow: 'warning',
    blue: 'default',
    green: 'success',
    red: 'destructive',
    orange: 'warning',
  };

  const canSubmitApplication =
    applicationStatus === 'draft' && profileCompletion >= 60 && documentsCount > 0;

  const quickActions = [
    {
      title: 'Complete Profile',
      description: 'Fill in your personal and professional details',
      icon: User,
      path: '/profile',
      disabled: applicationStatus === 'approved',
      color: 'primary',
    },
    {
      title: 'Upload Documents',
      description: 'Upload required identity and qualification documents',
      icon: FileText,
      path: '/documents',
      disabled: applicationStatus === 'approved',
      color: 'info',
    },
    {
      title: 'Submit Application',
      description: canSubmitApplication
        ? 'Your application is ready to submit'
        : 'Complete your profile and upload documents first',
      icon: ClipboardCheck,
      path: '/application-status',
      disabled: !canSubmitApplication,
      color: 'success',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, {user?.firstName || 'Provider'}
              </h1>
              <p className="mt-1 text-muted-foreground">
                Here is an overview of your profile and application status.
              </p>
            </div>
            <Badge variant={badgeVariantMap[statusInfo.color] || 'secondary'} className="w-fit">
              {statusInfo.label}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Profile Completion"
            value={`${profileCompletion}%`}
            icon={User}
            description={profileCompletion < 100 ? 'Keep filling your profile' : 'Fully completed'}
            color="primary"
          />
          <StatsCard
            title="Documents Uploaded"
            value={documentsCount}
            icon={FileText}
            description="Identity & qualification docs"
            color="info"
          />
          <StatsCard
            title="Application Status"
            value={statusInfo.label}
            icon={ClipboardCheck}
            color={
              applicationStatus === 'approved'
                ? 'success'
                : applicationStatus === 'rejected'
                  ? 'danger'
                  : 'warning'
            }
          />
          <StatsCard
            title="Days Since Registration"
            value={daysSinceRegistration}
            icon={Calendar}
            description={createdAt ? `Registered ${formatDate(createdAt)}` : ''}
            color="info"
          />
        </div>
      </motion.div>

      {/* Profile Completion Progress */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
            {profileCompletion < 100 && (
              <p className="text-xs text-muted-foreground">
                Complete your profile to at least 60% before submitting your application.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  onClick={() => !action.disabled && navigate(action.path)}
                  disabled={action.disabled}
                  className="flex w-full items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="rounded-lg bg-primary/10 p-2.5">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  {!action.disabled && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  {action.disabled && action.title === 'Submit Application' && (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  {action.disabled && action.title !== 'Submit Application' && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              {statusHistory.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => navigate('/application-status')}
                >
                  View all
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {recentHistory.length > 0 ? (
                <StatusTimeline history={recentHistory} />
              ) : (
                <EmptyState
                  icon={LayoutDashboard}
                  title="No activity yet"
                  description="Your status history will appear here once you start the application process."
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
