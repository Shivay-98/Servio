import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon: Icon, description, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20',
    success: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
    warning: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
    danger: 'from-red-500/10 to-red-500/5 border-red-500/20',
    info: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
  };

  const iconColorMap = {
    primary: 'text-indigo-500 bg-indigo-500/10',
    success: 'text-emerald-500 bg-emerald-500/10',
    warning: 'text-amber-500 bg-amber-500/10',
    danger: 'text-red-500 bg-red-500/10',
    info: 'text-blue-500 bg-blue-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border bg-gradient-to-br p-6 ${colorMap[color]}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-lg p-2.5 ${iconColorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={trend >= 0 ? 'text-emerald-500' : 'text-red-500'}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-muted-foreground">from last month</span>
        </div>
      )}
    </motion.div>
  );
}
