import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Eye, AlertCircle, Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { getProviders } from '../../services/admin.service';
import { getInitials, formatDate } from '../../utils/helpers';
import { APPLICATION_STATUSES } from '../../constants';

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default function ProvidersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'providers', { page, search, status: statusFilter, sort: sortBy }],
    queryFn: () =>
      getProviders({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort: sortBy,
      }),
    keepPreviousData: true,
  });

  const providers = (data?.data || []).filter((p) => p.user !== null && p.user !== undefined);
  const pagination = data?.pagination || {};

  const statusBadge = (status) => {
    const map = {
      draft: 'secondary',
      submitted: 'default',
      under_review: 'warning',
      approved: 'default',
      rejected: 'destructive',
      suspended: 'destructive',
    };
    return map[status] || 'secondary';
  };

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load providers"
        description="Could not load providers list."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Providers</h1>
        <p className="text-sm text-muted-foreground">Manage service provider applications</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search by name, email, or city..."
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {APPLICATION_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Newest</SelectItem>
                <SelectItem value="-createdAt">Oldest</SelectItem>
                <SelectItem value="user.firstName">Name A-Z</SelectItem>
                <SelectItem value="-user.firstName">Name Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton />
            </div>
          ) : providers.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title="No providers found"
                description={search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No providers have registered yet'}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Provider</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">City</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Completion</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Registered</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
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
                      <td className="px-4 py-3">{p.category?.name || '—'}</td>
                      <td className="px-4 py-3">{p.address?.city || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary transition-all"
                              style={{ width: `${p.profileCompletion || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{p.profileCompletion || 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadge(p.applicationStatus)}>{p.applicationStatus}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/providers/${p._id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </motion.div>
  );
}
