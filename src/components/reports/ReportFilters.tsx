import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface ReportFiltersState {
  dateRange: string;
  fromDate: string;
  toDate: string;
  reportType: string;
  groupBy: string;
}

interface ReportFiltersProps {
  filters: ReportFiltersState;
  onFilterChange: (filters: ReportFiltersState) => void;
  onApply: () => void;
  onReset: () => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFilterChange,
  onApply,
  onReset,
}) => {
  const handleDateRangeChange = (value: string) => {
    const now = new Date();
    let fromDate = format(startOfMonth(now), 'yyyy-MM-dd');
    let toDate = format(endOfMonth(now), 'yyyy-MM-dd');

    switch (value) {
      case 'this_month':
        fromDate = format(startOfMonth(now), 'yyyy-MM-dd');
        toDate = format(endOfMonth(now), 'yyyy-MM-dd');
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        fromDate = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
        toDate = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
        break;
      case 'last_3_months':
        fromDate = format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd');
        toDate = format(endOfMonth(now), 'yyyy-MM-dd');
        break;
      case 'last_6_months':
        fromDate = format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd');
        toDate = format(endOfMonth(now), 'yyyy-MM-dd');
        break;
      case 'this_year':
        fromDate = format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd');
        toDate = format(new Date(now.getFullYear(), 11, 31), 'yyyy-MM-dd');
        break;
    }

    onFilterChange({
      ...filters,
      dateRange: value,
      fromDate,
      toDate,
    });
  };

  const handleFromDateChange = (date: string) => {
    onFilterChange({
      ...filters,
      dateRange: 'custom',
      fromDate: date,
    });
  };

  const handleToDateChange = (date: string) => {
    onFilterChange({
      ...filters,
      dateRange: 'custom',
      toDate: date,
    });
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Filters</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Range Selector */}
        <div className="space-y-2">
          <Label htmlFor="dateRange" className="text-sm font-medium">
            Date Range
          </Label>
          <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger id="dateRange" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range */}
        {filters.dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fromDate" className="text-sm font-medium">
                From
              </Label>
              <Input
                id="fromDate"
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toDate" className="text-sm font-medium">
                To
              </Label>
              <Input
                id="toDate"
                type="date"
                value={filters.toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Report Type */}
        <div className="space-y-2">
          <Label htmlFor="reportType" className="text-sm font-medium">
            Report Type
          </Label>
          <Select
            value={filters.reportType}
            onValueChange={(value) =>
              onFilterChange({ ...filters, reportType: value })
            }
          >
            <SelectTrigger id="reportType" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="sales">Sales Performance</SelectItem>
              <SelectItem value="customers">Customer Analytics</SelectItem>
              <SelectItem value="products">Product Performance</SelectItem>
              <SelectItem value="dealers">Dealer Performance</SelectItem>
              <SelectItem value="regions">Regional Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Group By */}
        <div className="space-y-2">
          <Label htmlFor="groupBy" className="text-sm font-medium">
            Group By
          </Label>
          <Select
            value={filters.groupBy}
            onValueChange={(value) =>
              onFilterChange({ ...filters, groupBy: value })
            }
          >
            <SelectTrigger id="groupBy" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="region">By Region</SelectItem>
              <SelectItem value="dealer">By Dealer</SelectItem>
              <SelectItem value="product">By Product</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onApply}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
