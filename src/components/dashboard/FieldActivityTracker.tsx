import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  Map,
  TrendingUp,
  MapPin,
} from 'lucide-react';

interface ActivityDay {
  demos: number;
  meetings: number;
  exhibitions: number;
}

interface UpcomingEvent {
  title: string;
  location: string;
  count?: number;
}

interface GeoData {
  region: string;
  intensity: 'High' | 'Medium' | 'Low';
}

interface FieldActivityTrackerProps {
  todayActivity: ActivityDay;
  tomorrowEvents: UpcomingEvent[];
  geoHeatmap: GeoData[];
}

const getIntensityColor = (intensity: 'High' | 'Medium' | 'Low'): string => {
  switch (intensity) {
    case 'High':
      return 'bg-destructive/20 text-destructive border-destructive/30';
    case 'Medium':
      return 'bg-warning/20 text-warning border-warning/30';
    case 'Low':
      return 'bg-success/20 text-success border-success/30';
    default:
      return 'bg-muted/20 text-muted-foreground border-muted/30';
  }
};

const getIntensityBadgeColor = (intensity: 'High' | 'Medium' | 'Low') => {
  switch (intensity) {
    case 'High':
      return 'bg-destructive text-destructive-foreground';
    case 'Medium':
      return 'bg-warning text-warning-foreground';
    case 'Low':
      return 'bg-success text-success-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const FieldActivityTracker: React.FC<FieldActivityTrackerProps> = ({
  todayActivity,
  tomorrowEvents,
  geoHeatmap,
}) => {
  const totalToday = todayActivity.demos + todayActivity.meetings + todayActivity.exhibitions;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Today's Activity */}
      <Card className="border-l-4 border-l-primary lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Today's Activity</CardTitle>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* Demos */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Demos</p>
                  <p className="text-lg font-bold text-foreground">{todayActivity.demos}</p>
                </div>
              </div>
            </div>

            {/* Farmer Meetings */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-info/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/20">
                  <Users className="w-4 h-4 text-info" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Farmer Meetings</p>
                  <p className="text-lg font-bold text-foreground">{todayActivity.meetings}</p>
                </div>
              </div>
            </div>

            {/* Exhibitions */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Calendar className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Exhibitions</p>
                  <p className="text-lg font-bold text-foreground">{todayActivity.exhibitions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Badge */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total Activities</span>
              <Badge className="bg-primary text-primary-foreground">{totalToday}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tomorrow's Events */}
      <Card className="border-l-4 border-l-info lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Upcoming Events</CardTitle>
            <Calendar className="w-5 h-5 text-info" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {tomorrowEvents.map((event, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{event.title}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                {event.count && (
                  <Badge variant="secondary" className="whitespace-nowrap">
                    {event.count} farmers
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Geo-Heatmap */}
      <Card className="border-l-4 border-l-accent lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Geo-Heatmap</CardTitle>
            <Map className="w-5 h-5 text-accent" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {geoHeatmap.map((geo, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-3 rounded-lg border ${getIntensityColor(
                geo.intensity
              )}`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="font-medium text-sm">{geo.region}</span>
              </div>
              <Badge className={getIntensityBadgeColor(geo.intensity)}>
                {geo.intensity}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
