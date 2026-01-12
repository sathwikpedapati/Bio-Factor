import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'sales' | 'manufacturing' | 'qc' | 'warehouse' | 'finance' | 'hr' | 'fieldops' | 'rnd';
  className?: string;
}

const variantStyles = {
  default: 'border-l-primary',
  sales: 'border-l-department-sales',
  manufacturing: 'border-l-department-manufacturing',
  qc: 'border-l-department-qc',
  warehouse: 'border-l-department-warehouse',
  finance: 'border-l-department-finance',
  hr: 'border-l-department-hr',
  fieldops: 'border-l-department-fieldops',
  rnd: 'border-l-department-rnd',
};

const iconBgStyles = {
  default: 'bg-primary/10 text-primary',
  sales: 'bg-department-sales/10 text-department-sales',
  manufacturing: 'bg-department-manufacturing/10 text-department-manufacturing',
  qc: 'bg-department-qc/10 text-department-qc',
  warehouse: 'bg-department-warehouse/10 text-department-warehouse',
  finance: 'bg-department-finance/10 text-department-finance',
  hr: 'bg-department-hr/10 text-department-hr',
  fieldops: 'bg-department-fieldops/10 text-department-fieldops',
  rnd: 'bg-department-rnd/10 text-department-rnd',
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = 'default',
  className,
}) => {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return '';
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div
      className={cn(
        'kpi-card border-l-4 animate-fade-in',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-foreground">{value}</p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', getTrendColor())}>
              {getTrendIcon()}
              <span className="font-medium">{Math.abs(change)}%</span>
              {changeLabel && (
                <span className="text-muted-foreground ml-1">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-xl', iconBgStyles[variant])}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
