import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer } from 'recharts';

interface FunnelStep {
  name: string;
  value: number;
}

export const SalesFunnel: React.FC<{ data: FunnelStep[] }> = ({ data }) => {
  return (
    <Card>
      <CardContent>
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground">Sales Funnel</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Leads → Prospects → Orders → Closed Deals</p>
        </div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="value" data={data} isAnimationActive>
                <LabelList position="right" fill="#111827" stroke="none" dataKey="name" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesFunnel;
