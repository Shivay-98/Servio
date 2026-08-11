import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle, Ban, Trash2, Mail, Phone, MapPin, Calendar, FileText, Download, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import EmptyState from '../../components/common/EmptyState';
import { getProviderById, reviewApplication, suspendProvider, deleteProvider } from '../../services/admin.service';
import { getInitials, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export default function ProviderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [reviewComment, setReviewComment] = useState('');
  const [suspendReason, setSuspendReason] = useState('');

  const { data: provider, isLoading, isError } = useQuery({
    queryKey: ['admin', 'provider', id],
    queryFn: () => getProviderById(id),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ status, reason }) => reviewApplication(id, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'provider', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
      toast.success('Application reviewed successfully');
      setReviewComment('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to review application');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (reason) => suspendProvider(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'provider', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
      toast.success('Provider suspended successfully');
      setSuspendReason('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to suspend provider');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProvider(id),
    onSuccess: () => {
      toast.success('Provider deleted successfully');
      navigate('/admin/providers');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete provider');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <DetailSkeleton />
      </div>
    );
  }

  const p = provider?.data?.profile || provider?.data;
  const user = p?.user;

  if (isError || !provider?.data || !p || !user) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Provider not found"
        description="Could not load provider details, or this provider profile is orphaned."
        action={<Button onClick={() => navigate('/admin/providers')}>Back to Providers</Button>}
      />
    );
  }

  const docs = provider.data.documents || p.documents || [];

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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/providers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Provider Details</h1>
          <p className="text-sm text-muted-foreground">Review and manage provider application</p>
        </div>
      </div>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={p.profilePhoto?.url} />
              <AvatarFallback className="text-2xl">
                {getInitials(`${user?.firstName || ''} ${user?.lastName || ''}`)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
                <p className="text-muted-foreground">{p.categories?.map(c => c.name).join(', ') || 'No category'}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                {p.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{p.phone}</span>
                  </div>
                )}
                {p.address?.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{p.address.city}, {p.address.state}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(p.createdAt)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={statusBadge(p.applicationStatus)}>{p.applicationStatus}</Badge>
                <Badge variant="outline">
                  Profile {p.profileCompletion || 0}% Complete
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents ({docs.length})</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* About */}
          {p.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{p.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Experience */}
          {(p.experience?.years || p.experience?.description) && (
            <Card>
              <CardHeader>
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{p.experience?.years ?? 0} years of experience</p>
                {p.experience?.description && (
                  <p className="text-sm text-muted-foreground mt-1">{p.experience.description}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {p.skills?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {p.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service Area */}
          {p.serviceArea?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Service Area</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {p.serviceArea.map((area) => (
                    <Badge key={area} variant="outline">{area}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Address */}
          {p.address && (
            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{p.address.street}</p>
                <p>{p.address.city}, {p.address.state} {p.address.zipCode}</p>
                <p>{p.address.country}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {docs.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <EmptyState
                  icon={FileText}
                  title="No documents"
                  description="No documents have been uploaded yet."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {docs.map((doc) => (
                <Card key={doc._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{doc.name || doc.type}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded {formatDate(doc.createdAt || doc.uploadedAt)}
                        </p>
                        <Badge variant={doc.verificationStatus === 'verified' || doc.verified ? 'default' : 'secondary'}>
                          {doc.verificationStatus === 'verified' || doc.verified ? 'Verified' : 'Pending Verification'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {doc.url && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {doc.url && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={doc.url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          {/* Review Application */}
          {p.applicationStatus === 'submitted' && (
            <Card>
              <CardHeader>
                <CardTitle>Review Application</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="review-comment">Review Comment</Label>
                  <Textarea
                    id="review-comment"
                    placeholder="Add a comment about your decision..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => reviewMutation.mutate({ status: 'approved', reason: reviewComment })}
                    disabled={reviewMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => reviewMutation.mutate({ status: 'rejected', reason: reviewComment })}
                    disabled={reviewMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suspend Provider */}
          {p.applicationStatus !== 'suspended' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Suspend Provider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Suspending a provider will prevent them from accessing the platform.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="suspend-reason">Reason for Suspension</Label>
                  <Textarea
                    id="suspend-reason"
                    placeholder="Explain why you're suspending this provider..."
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={!suspendReason.trim()}>
                      <Ban className="mr-2 h-4 w-4" />
                      Suspend Provider
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Suspend Provider?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will suspend the provider's account. They will not be able to access the platform until unsuspended.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => suspendMutation.mutate(suspendReason)}
                        disabled={suspendMutation.isPending}
                      >
                        Suspend
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}

          {/* Delete Provider */}
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Delete Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Permanently delete this provider and all associated data. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Provider
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Provider Permanently?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All data associated with this provider will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
