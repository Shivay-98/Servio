import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, UserCheck, UserX, Clock,
  TrendingUp, MapPin, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StatsCard from '../../components/common/StatsCard';
import EmptyState from '../../components/common/EmptyState';
import ChartWrapper from '../../components/charts/ChartWrapper';
import { getDashboard, getAnalytics } from '../../services/admin.service';
import { getInitials, formatDate } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: dashData, isLoading: dashLoading, isError } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getDashboard,
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: getAnalytics,
  });

  const isLoading = dashLoading || analyticsLoading;

  if (isLoading) return <AdminDashboardSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load dashboard"
        description="Could not load admin dashboard data."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  const dashboard = dashData?.data || {};
  const analytics = analyticsData?.data || {};

  const stats = dashboard.stats || {};
  const recentProviders = (dashboard.recentProviders || []).filter((p) => p.user !== null && p.user !== undefined);
  const monthlyRegistrations = analytics.monthlyRegistrations || [];
  const statusDistribution = analytics.statusDistribution || [];
  const topCities = analytics.topCities || [];

  const registrationChartData = {
    labels: monthlyRegistrations.map((m) => m.month || m._id),
    datasets: [
      {
        label: 'Registrations',
        data: monthlyRegistrations.map((m) => m.count),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const statusChartData = {
    labels: statusDistribution.map((s) => s._id || s.status),
    datasets: [
      {
        data: statusDistribution.map((s) => s.count),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const cityChartData = {
    labels: topCities.slice(0, 8).map((c) => c._id || c.city),
    datasets: [
      {
        label: 'Providers',
        data: topCities.slice(0, 8).map((c) => c.count),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  const statusBadge = (status) => {
    const map = {
      draft: 'secondary',
      submitted: 'default',
      under_review: 'warning',
      approved: 'default',
      rejected: 'destructive',
    };
    return map[status] || 'secondary';
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of the platform</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Providers" value={stats.totalProviders ?? 0} icon={Users} color="primary" />
          <StatsCard title="Approved" value={stats.approvedProviders ?? 0} icon={UserCheck} color="success" />
          <StatsCard title="Pending Review" value={stats.pendingProviders ?? 0} icon={Clock} color="warning" />
          <StatsCard title="Rejected" value={stats.rejectedProviders ?? 0} icon={UserX} color="danger" />
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" /> Monthly Registrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyRegistrations.length > 0 ? (
                <ChartWrapper type="line" data={registrationChartData} height="280px" />
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">No registration data</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {statusDistribution.length > 0 ? (
                <ChartWrapper type="doughnut" data={statusChartData} height="280px" options={{ cutout: '60%' }} />
              ) : (
                <p className="py-12 text-sm text-muted-foreground">No status data</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Cities */}
      {topCities.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" /> Top Cities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartWrapper type="bar" data={cityChartData} height="250px" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Providers */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Providers</CardTitle>
          </CardHeader>
          <CardContent>
            {recentProviders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No providers yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-muted-foreground">Provider</th>
                      <th className="pb-3 font-medium text-muted-foreground">Category</th>
                      <th className="pb-3 font-medium text-muted-foreground">City</th>
                      <th className="pb-3 font-medium text-muted-foreground">Status</th>
                      <th className="pb-3 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProviders.map((p) => (
                      <tr key={p._id} className="border-b last:border-0">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={p.profilePhoto?.url} />
                              <AvatarFallback className="text-xs">
                                {getInitials(p.user?.firstName, p.user?.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{p.user?.firstName} {p.user?.lastName}</p>
                              <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">{p.category?.name || '—'}</td>
                        <td className="py-3">{p.address?.city || '—'}</td>
                        <td className="py-3">
                          <Badge variant={statusBadge(p.applicationStatus)}>{p.applicationStatus}</Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
