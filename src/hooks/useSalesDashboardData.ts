import { useMemo } from 'react';

export function useSalesDashboardData() {
  const funnel = useMemo(() => [
    { name: 'Leads', value: 4200 },
    { name: 'Prospects', value: 1200 },
    { name: 'Orders', value: 320 },
    { name: 'Closed', value: 210 },
  ], []);

  const states = useMemo(() => [
    { state: 'Karnataka', sales: 5200000 },
    { state: 'Maharashtra', sales: 4800000 },
    { state: 'Tamil Nadu', sales: 3600000 },
    { state: 'Uttar Pradesh', sales: 2400000 },
    { state: 'Bihar', sales: 1200000 },
    { state: 'Punjab', sales: 900000 },
  ], []);

  const campaigns = useMemo(() => [
    { id: 'c1', name: 'Summer Promo', channel: 'Digital Ads', start: '2025-03-01', end: '2025-04-15', roi: 120, progress: 80, active: true },
    { id: 'c2', name: 'Distributor Drive', channel: 'Field Events', start: '2025-01-10', end: '2025-02-28', roi: 85, progress: 100, active: false },
    { id: 'c3', name: 'Festive Offers', channel: 'Email + SMS', start: '2025-10-01', end: '2025-10-30', roi: 200, progress: 45, active: true },
  ], []);

  const feedback = useMemo(() => [
    { id: 'f1', customer: 'Ramesh Kumar', rating: 4, message: 'Product quality is good but delivery delayed', status: 'in_progress' },
    { id: 'f2', customer: 'Green Farms', rating: 2, message: 'Incorrect invoice amount', status: 'open' },
    { id: 'f3', customer: 'Agri Supplies', rating: 5, message: 'Excellent support and timely delivery', status: 'closed' },
  ], []);

  return { funnel, states, campaigns, feedback };
}

export default useSalesDashboardData;
