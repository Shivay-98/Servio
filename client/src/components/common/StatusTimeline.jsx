import { motion } from 'framer-motion';

export default function StatusTimeline({ history = [] }) {
  const statusConfig = {
    draft: { color: 'bg-zinc-500', label: 'Draft' },
    pending: { color: 'bg-amber-500', label: 'Pending Review' },
    under_review: { color: 'bg-blue-500', label: 'Under Review' },
    approved: { color: 'bg-emerald-500', label: 'Approved' },
    rejected: { color: 'bg-red-500', label: 'Rejected' },
    suspended: { color: 'bg-orange-500', label: 'Suspended' },
    unsuspended: { color: 'bg-teal-500', label: 'Unsuspended' },
  };

  return (
    <div className="relative space-y-0">
      {history.map((item, index) => {
        const config = statusConfig[item.status] || { color: 'bg-zinc-500', label: item.status };
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {index < history.length - 1 && (
              <div className="absolute left-[11px] top-6 h-full w-0.5 bg-border" />
            )}
            <div className={`relative z-10 mt-1 h-6 w-6 flex-shrink-0 rounded-full border-2 border-background ${config.color}`} />
            <div className="flex-1">
              <p className="font-medium">{config.label}</p>
              {item.comment && (
                <p className="mt-0.5 text-sm text-muted-foreground">{item.comment}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(item.changedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {item.changedBy && (
                  <span> by {item.changedBy.firstName} {item.changedBy.lastName}</span>
                )}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
