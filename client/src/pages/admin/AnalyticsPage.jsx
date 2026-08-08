import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, FileCheck, Calendar, AlertCircle, BarChart3, PieChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCard from '../../components/common/StatsCard';
import EmptyState from '../../components/common/EmptyState';
import ChartWrapper from '../../components/charts/ChartWrapper';
import { getAnalytics } from '../../services/admin.service';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: getAnalytics,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Detailed insights and trends</p>
        </div>
        <AnalyticsSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load analytics"
        description="Could not load analytics data."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  const analytics = data?.data || {};
  const overview = analytics.overview || {};
  const monthlyRegistrations = analytics.monthlyRegistrations || [];
  const categoryDistribution = analytics.categoryDistribution || [];
  const statusBreakdown = analytics.statusBreakdown || [];

  // Format month labels for registration chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const registrationChartData = {
    labels: monthlyRegistrations.map((d) => monthNames[d._id?.month - 1] || d._id?.month || ''),
    datasets: [
      {
        label: 'New Registrations',
        data: monthlyRegistrations.map((d) => d.count || 0),
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsla(var(--primary), 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const categoryChartData = {
    labels: categoryDistribution.map((d) => d._id || d.name || 'Unknown'),
    datasets: [
      {
        label: 'Providers',
        data: categoryDistribution.map((d) => d.count || 0),
        backgroundColor: [
          'hsl(var(--chart-1))',
          'hsl(var(--chart-2))',
          'hsl(var(--chart-3))',
          'hsl(var(--chart-4))',
          'hsl(var(--chart-5))',
        ],
      },
    ],
  };

  const statusChartData = {
    labels: statusBreakdown.map((d) => {
      const status = d._id || d.status || 'unknown';
      return status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    }),
    datasets: [
      {
        label: 'Applications',
        data: statusBreakdown.map((d) => d.count || 0),
        backgroundColor: [
          'hsl(var(--chart-1))',
          'hsl(var(--chart-2))',
          'hsl(var(--chart-3))',
          'hsl(var(--chart-4))',
          'hsl(var(--chart-5))',
        ],
      },
    ],
  };

  const approvalChartData = {
    labels: [],
    datasets: [
      {
        label: 'Approved',
        data: [],
        borderColor: 'hsl(142, 76%, 36%)',
        backgroundColor: 'hsla(142, 76%, 36%, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Rejected',
        data: [],
        borderColor: 'hsl(0, 84%, 60%)',
        backgroundColor: 'hsla(0, 84%, 60%, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Detailed insights and trends</p>
      </div>

      {/* Key Metrics */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Providers"
          value={overview.total || 0}
          icon={Users}
        />
        <StatsCard
          title="Pending"
          value={overview.pending || 0}
          icon={Calendar}
          description="Awaiting review"
        />
        <StatsCard
          title="Approved"
          value={overview.approved || 0}
          icon={FileCheck}
        />
        <StatsCard
          title="Draft"
          value={overview.draft || 0}
          icon={TrendingUp}
          description="Incomplete profiles"
        />
      </motion.div>

      {/* Charts */}
      <Tabs defaultValue="registrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="registrations">
            <BarChart3 className="mr-2 h-4 w-4" />
            Registrations
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChart className="mr-2 h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="status">
            <PieChart className="mr-2 h-4 w-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="approvals">
            <TrendingUp className="mr-2 h-4 w-4" />
            Approvals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Registration Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWrapper type="line" data={registrationChartData} />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Providers by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWrapper type="doughnut" data={categoryChartData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.categoryDistribution?.slice(0, 5).map((cat, i) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {i + 1}
                        </div>
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{cat.count} providers</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Application Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWrapper type="pie" data={statusChartData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.statusDistribution?.map((stat) => (
                    <div key={stat.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${
                          stat.status === 'approved' ? 'bg-green-500' :
                          stat.status === 'rejected' ? 'bg-red-500' :
                          stat.status === 'under_review' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`} />
                        <span className="capitalize">{stat.status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{stat.count}</span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.round((stat.count / analytics.totalProviders) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Approval & Rejection Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartWrapper type="line" data={approvalChartData} />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.totalApproved || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {analytics.totalRejected || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {analytics.pendingReview || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
