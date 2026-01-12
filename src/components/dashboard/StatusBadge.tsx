import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'pending' 
  | 'default';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  className?: string;
  dot?: boolean;
}

const statusStyles: Record<StatusType, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-destructive/10 text-destructive border-destructive/20',
  info: 'bg-info/10 text-info border-info/20',
  pending: 'bg-muted text-muted-foreground border-border',
  default: 'bg-secondary text-secondary-foreground border-border',
};

const dotStyles: Record<StatusType, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-destructive',
  info: 'bg-info',
  pending: 'bg-muted-foreground',
  default: 'bg-muted-foreground',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
  dot = false,
}) => {
  return (
    <span
      className={cn(
        'status-badge border',
        statusStyles[status],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', dotStyles[status])} />
      )}
      {label}
    </span>
  );
};
