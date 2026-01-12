import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FeedbackItem {
  id: string;
  customer: string;
  rating: number;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
}

export const FeedbackPanel: React.FC<{ data: FeedbackItem[] }> = ({ data }) => {
  return (
    <Card>
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Customer Feedback & Complaints</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Recent feedback and complaint statuses</p>
          </div>
          <Button size="sm" variant="ghost">Manage</Button>
        </div>
        <div className="space-y-2">
          {data.map(f => (
            <div key={f.id} className="p-3 rounded-md border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{f.customer} <span className="text-xs text-muted-foreground">• {f.rating}★</span></div>
                  <div className="text-sm text-muted-foreground mt-1">{f.message}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs px-2 py-1 rounded-md" style={{ background: f.status === 'open' ? 'rgb(255,235,230)' : f.status === 'in_progress' ? 'rgb(255,249,230)' : 'rgb(235,255,235)' }}>
                    {f.status.replace('_', ' ')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackPanel;
