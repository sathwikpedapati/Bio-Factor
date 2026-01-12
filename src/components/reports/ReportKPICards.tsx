import React from 'react';
import { KPICard } from '@/components/dashboard/KPICard';
import {
  DollarSign,
  Users,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface KPIData {
  totalRevenue: number;
  newCustomers: number;
  conversionRate: number;
  totalOrders: number;
  revenueChange?: number;
  customersChange?: number;
  conversionChange?: number;
  ordersChange?: number;
}

interface ReportKPICardsProps {
  data: KPIData;
  isLoading?: boolean;
  className?: string;
}

export const ReportKPICards: React.FC<ReportKPICardsProps> = ({
  data,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {/* Total Revenue */}
      <KPICard
        title="Total Revenue"
        value={`₹${(data.totalRevenue / 100000).toFixed(2)}L`}
        change={data.revenueChange}
        changeLabel={data.revenueChange ? 'vs last period' : undefined}
        icon={DollarSign}
        variant="sales"
      />

      {/* New Customers */}
      <KPICard
        title="New Customers"
        value={data.newCustomers.toLocaleString()}
        change={data.customersChange}
        changeLabel={data.customersChange ? 'vs last period' : undefined}
        icon={Users}
        variant="sales"
      />

      {/* Conversion Rate */}
      <KPICard
        title="Conversion Rate"
        value={`${data.conversionRate.toFixed(2)}%`}
        change={data.conversionChange}
        changeLabel={data.conversionChange ? 'vs last period' : undefined}
        icon={TrendingUp}
        variant="sales"
      />

      {/* Total Orders */}
      <KPICard
        title="Total Orders"
        value={data.totalOrders.toLocaleString()}
        change={data.ordersChange}
        changeLabel={data.ordersChange ? 'vs last period' : undefined}
        icon={ShoppingCart}
        variant="sales"
      />
    </div>
  );
};
