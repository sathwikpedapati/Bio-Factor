import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StateData {
  state: string;
  sales: number;
}

const colorFor = (value: number, max: number) => {
  const ratio = max === 0 ? 0 : value / max;
  // from light to deep sales color
  const r = Math.floor(255 - ratio * 120);
  const g = Math.floor(250 - ratio * 120);
  const b = Math.floor(240 - ratio * 90);
  return `rgb(${r}, ${g}, ${b})`;
};

export const DistributorHeatmap: React.FC<{ data: StateData[] }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.sales), 0);

  return (
    <Card>
      <CardContent>
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground">Distributor / Dealer Map</h3>
          <p className="text-sm text-muted-foreground mt-0.5">State / District-wise sales heatmap</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {data.map(d => (
            <div key={d.state} className="p-3 rounded-md shadow-sm" style={{ background: colorFor(d.sales, max) }}>
              <div className="text-sm font-medium">{d.state}</div>
              <div className="text-xs text-muted-foreground">₹{(d.sales / 1000).toFixed(1)}K</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DistributorHeatmap;
