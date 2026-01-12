import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  start: string;
  end: string;
  roi: number;
  progress: number; // 0-100
  active: boolean;
}

export const CampaignTracker: React.FC<{ data: Campaign[] }> = ({ data }) => {
  return (
    <Card>
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Campaign Tracker</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Ongoing promotions & digital campaign ROI</p>
          </div>
          <Button size="sm" variant="ghost">View All</Button>
        </div>

        <div className="space-y-3">
          {data.map(c => (
            <div key={c.id} className="p-3 rounded-md border">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-muted-foreground">{c.channel} • {c.start} to {c.end}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm">ROI: <span className="font-semibold">{c.roi}%</span></div>
                  <div className="text-xs text-muted-foreground">{c.active ? 'Active' : 'Completed'}</div>
                </div>
              </div>
              <div className="w-full h-2 bg-muted rounded overflow-hidden">
                <div className="h-2 bg-success" style={{ width: `${Math.min(100, Math.max(0, c.progress))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignTracker;
