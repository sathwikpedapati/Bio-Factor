import { useState, useCallback } from 'react';

export interface FetchReportsParams {
  fromDate?: string;
  toDate?: string;
  reportType?: string;
  groupBy?: string;
  limit?: number;
}

export interface ReportRow {
  id: string;
  date: string;
  order_number: string;
  dealer_name: string;
  region: string;
  amount: number;
  quantity: number;
  status: string;
  description: string;
}

export interface ChartDataPoint {
  period: string;
  revenue: number;
  orders: number;
  customers?: number;
  conversionRate?: number;
}

export interface KPIMetrics {
  totalRevenue: number;
  newCustomers: number;
  conversionRate: number;
  totalOrders: number;
  revenueChange?: number;
  customersChange?: number;
  conversionChange?: number;
  ordersChange?: number;
}

export interface FetchReportsResponse {
  kpis: KPIMetrics;
  chartData: ChartDataPoint[];
  tableData: ReportRow[];
}

// Mock data generator
const generateMockTableData = (count: number): ReportRow[] => {
  const dealers = ['Dealer A', 'Dealer B', 'Dealer C', 'Dealer D', 'Dealer E'];
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  const statuses = ['Completed', 'Pending', 'Shipped', 'Delivered', 'Cancelled'];
  const products = ['Bio-Fertilizer', 'Pesticide', 'Growth Enhancer', 'Soil Conditioner', 'Micro Nutrients'];

  return Array.from({ length: count }, (_, i) => ({
    id: `order_${i + 1}`,
    date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    order_number: `ORD-${String(i + 1).padStart(5, '0')}`,
    dealer_name: dealers[Math.floor(Math.random() * dealers.length)],
    region: regions[Math.floor(Math.random() * regions.length)],
    amount: Math.floor(Math.random() * 500000) + 50000,
    quantity: Math.floor(Math.random() * 100) + 10,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    description: products[Math.floor(Math.random() * products.length)],
  }));
};

const generateMockChartData = (groupBy: string): ChartDataPoint[] => {
  const now = new Date();
  const dataPoints: ChartDataPoint[] = [];

  const getLabel = (days: number) => {
    const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    if (groupBy === 'weekly') {
      return `Week ${Math.ceil((now.getDate() - date.getDate()) / 7)}`;
    } else if (groupBy === 'daily') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    }
  };

  const daysToShow = groupBy === 'monthly' ? 6 : groupBy === 'weekly' ? 4 : 7;

  for (let i = daysToShow - 1; i >= 0; i--) {
    dataPoints.push({
      period: getLabel(i),
      revenue: Math.floor(Math.random() * 8000000) + 2000000,
      orders: Math.floor(Math.random() * 200) + 50,
      customers: Math.floor(Math.random() * 100) + 10,
      conversionRate: Math.floor(Math.random() * 30) + 5,
    });
  }

  return dataPoints;
};

/**
 * Hook to fetch sales reports with mock data
 * This can be replaced with actual API calls when backend is ready
 */
export const useFetchReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(
    async (params: FetchReportsParams = {}): Promise<FetchReportsResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const groupBy = params.groupBy || 'monthly';
        const limit = params.limit || 100;

        // Generate mock data
        const chartData = generateMockChartData(groupBy);
        const tableData = generateMockTableData(limit);

        // Calculate KPIs
        const totalRevenue = tableData.reduce((sum, row) => sum + row.amount, 0);
        const newCustomers = new Set(tableData.map((r) => r.dealer_name)).size;
        const completedOrders = tableData.filter((r) => r.status === 'Delivered').length;
        const conversionRate = (completedOrders / tableData.length) * 100;

        const kpis: KPIMetrics = {
          totalRevenue,
          newCustomers,
          conversionRate,
          totalOrders: tableData.length,
          revenueChange: Math.floor(Math.random() * 40) - 20,
          customersChange: Math.floor(Math.random() * 40) - 20,
          conversionChange: Math.floor(Math.random() * 30) - 15,
          ordersChange: Math.floor(Math.random() * 40) - 20,
        };

        return {
          kpis,
          chartData,
          tableData,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch reports';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    fetchReports,
    isLoading,
    error,
  };
};
