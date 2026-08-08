import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileUpload({
  onFileSelect,
  onFilesChange,
  files,
  accept = { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'], 'application/pdf': ['.pdf'] },
  maxSize = 5 * 1024 * 1024,
  maxFiles = 1,
  preview,
  onRemove,
  label = 'Upload File',
  description = 'PNG, JPG, WebP or PDF up to 5MB',
}) {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);

        // Support both callback styles
        if (onFileSelect) {
          onFileSelect(file);
        }
        if (onFilesChange) {
          onFilesChange(acceptedFiles);
        }
      }
    },
    [onFileSelect, onFilesChange]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: maxFiles > 1,
  });

  const handleRemove = () => {
    setSelectedFile(null);
    if (onRemove) {
      onRemove();
    }
    if (onFilesChange) {
      onFilesChange([]);
    }
  };

  // Use files prop if provided (controlled component)
  const displayFile = files && files.length > 0 ? files[0] : selectedFile;
  const displayPreview = preview || (displayFile ? URL.createObjectURL(displayFile) : null);

  useEffect(() => {
    // Cleanup object URLs
    return () => {
      if (displayFile && !preview) {
        URL.revokeObjectURL(URL.createObjectURL(displayFile));
      }
    };
  }, [displayFile, preview]);

  return (
    <div className="space-y-2">
      <AnimatePresence mode="wait">
        {displayPreview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden rounded-xl border border-border bg-card"
          >
            {displayFile?.type?.startsWith('image/') || (typeof displayPreview === 'string' && displayPreview.match(/\.(jpg|jpeg|png|webp|gif)$/i)) ? (
              <img src={displayPreview} alt="Preview" className="h-48 w-full object-cover" />
            ) : displayFile?.type === 'application/pdf' || (typeof displayPreview === 'string' && displayPreview.match(/\.pdf$/i)) ? (
              <div className="flex h-48 flex-col items-center justify-center bg-muted">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">{displayFile?.name || 'PDF Document'}</p>
              </div>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center bg-muted">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">{displayFile?.name || 'Document'}</p>
              </div>
            )}
            <button
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className={`mb-3 h-8 w-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="mb-1 text-sm font-medium">
              {isDragActive ? 'Drop file here' : label}
            </p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
      {fileRejections.length > 0 && (
        <p className="text-xs text-destructive">
          {fileRejections[0].errors[0]?.message || 'Invalid file'}
        </p>
      )}
    </div>
  );
}
