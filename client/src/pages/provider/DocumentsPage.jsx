import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Trash2, Eye, Loader2,
  CheckCircle2, Clock, XCircle, AlertCircle, ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import FileUpload from '../../components/common/FileUpload';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { getDocuments, uploadDocument, deleteDocument } from '../../services/document.service';
import { DOCUMENT_TYPES } from '../../constants';
import { formatDate, formatFileSize } from '../../utils/helpers';

const statusConfig = {
  pending: { label: 'Pending Review', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', variant: 'warning' },
  verified: { label: 'Verified', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', variant: 'default' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', variant: 'destructive' },
};

function DocumentsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-48 rounded-xl" />
      ))}
    </div>
  );
}

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [files, setFiles] = useState([]);

  const { data: docsData, isLoading, isError } = useQuery({
    queryKey: ['provider', 'documents'],
    queryFn: getDocuments,
  });

  const documents = docsData?.data || [];

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'documents'] });
      toast.success('Document uploaded successfully');
      setUploadOpen(false);
      setFiles([]);
      setSelectedType('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'documents'] });
      toast.success('Document deleted');
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete document'),
  });

  const handleUpload = () => {
    if (!selectedType) {
      toast.error('Please select a document type');
      return;
    }
    if (files.length === 0) {
      toast.error('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('document', files[0]);
    formData.append('type', selectedType);
    uploadMutation.mutate(formData);
  };

  const uploadedTypes = documents.map((d) => d.type);

  if (isLoading) return <DocumentsSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load documents"
        description="Please try again later."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage your verification documents
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents uploaded"
          description="Upload identity and qualification documents to proceed with your application."
          action={
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Upload Your First Document
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {documents.map((doc) => {
              const status = statusConfig[doc.verificationStatus] || statusConfig.pending;
              const StatusIcon = status.icon;
              const typeLabel = DOCUMENT_TYPES.find((t) => t.value === doc.type)?.label || doc.type;

              return (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg p-2 ${status.bg}`}>
                            <ShieldCheck className={`h-5 w-5 ${status.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold">{typeLabel}</CardTitle>
                            <CardDescription className="text-xs">
                              {formatDate(doc.createdAt)}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={status.variant}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{doc.originalName || 'Document'}</span>
                        {doc.fileSize && <span>{formatFileSize(doc.fileSize)}</span>}
                      </div>

                      {doc.rejectionReason && (
                        <div className="rounded-md bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
                          Reason: {doc.rejectionReason}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {doc.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setPreviewUrl(doc.url)}
                          >
                            <Eye className="mr-1 h-3 w-3" /> View
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(doc)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Select a document type and upload your file</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.filter((t) => !uploadedTypes.includes(t.value)).map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FileUpload
              files={files}
              onFilesChange={setFiles}
              maxFiles={1}
              accept={{
                'image/*': ['.png', '.jpg', '.jpeg'],
                'application/pdf': ['.pdf'],
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" /> Upload</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {previewUrl?.endsWith('.pdf') ? (
              <iframe src={previewUrl} className="h-[60vh] w-full rounded border" title="Document" />
            ) : (
              <img src={previewUrl} alt="Document" className="max-h-[60vh] rounded object-contain" />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Document"
        description={`Are you sure you want to delete this document? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
      />
    </motion.div>
  );
}
