import React from 'react';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Skeleton } from '@/components/ui/skeleton';

export interface ChartData {
  period: string;
  revenue: number;
  orders: number;
  customers?: number;
  conversionRate?: number;
}

interface ChartPanelProps {
  data: ChartData[];
  isLoading?: boolean;
  className?: string;
}

export const ChartPanel: React.FC<ChartPanelProps> = ({
  data,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Revenue Trend */}
      <ChartCard
        title="Revenue Trend"
        subtitle="Revenue in Lakhs (₹)"
        type="area"
        data={data}
        xAxisKey="period"
        dataKeys={[
          {
            key: 'revenue',
            color: 'hsl(142 60% 35%)',
            name: 'Revenue',
          },
        ]}
        height={300}
      />

      {/* Order Volume */}
      <ChartCard
        title="Order Volume"
        subtitle="Number of orders"
        type="bar"
        data={data}
        xAxisKey="period"
        dataKeys={[
          {
            key: 'orders',
            color: 'hsl(199 89% 48%)',
            name: 'Orders',
          },
        ]}
        height={300}
      />

      {/* Customers & Conversion */}
      {data.some((d) => d.customers !== undefined) && (
        <ChartCard
          title="New Customers"
          subtitle="Customer acquisition"
          type="line"
          data={data}
          xAxisKey="period"
          dataKeys={[
            {
              key: 'customers',
              color: 'hsl(38 92% 50%)',
              name: 'New Customers',
            },
          ]}
          height={300}
        />
      )}

      {/* Conversion Rate */}
      {data.some((d) => d.conversionRate !== undefined) && (
        <ChartCard
          title="Conversion Rate"
          subtitle="Percentage (%)"
          type="line"
          data={data}
          xAxisKey="period"
          dataKeys={[
            {
              key: 'conversionRate',
              color: 'hsl(142 70% 40%)',
              name: 'Conversion Rate',
            },
          ]}
          height={300}
        />
      )}
    </div>
  );
};
