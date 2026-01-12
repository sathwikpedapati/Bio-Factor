import React, { useState } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export';

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  invoice_date: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
}

interface Order {
  id: string;
  net_amount: number;
  status: string;
}

export default function FinanceReportsPage() {
  const [reportType, setReportType] = useState('revenue');
  const [dateRange, setDateRange] = useState('month');

  const { data: invoices = [] } = useSupabaseQuery<Invoice>('invoices');
  const { data: payments = [] } = useSupabaseQuery<Payment>('payments');
  const { data: orders = [] } = useSupabaseQuery<Order>('orders');

  const getDateRangeFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  };

  const filterByDateRange = (dateStr: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date >= getDateRangeFilter();
  };

  const calculateRevenueReport = () => {
    const filteredInvoices = invoices.filter(inv => filterByDateRange(inv.invoice_date));
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const paidRevenue = filteredInvoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
    const pendingRevenue = totalRevenue - paidRevenue;
    const paidPercentage = totalRevenue > 0 ? ((paidRevenue / totalRevenue) * 100).toFixed(2) : 0;

    return {
      title: 'Revenue Report',
      metrics: [
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}` },
        { label: 'Paid Amount', value: `₹${paidRevenue.toLocaleString()}` },
        { label: 'Pending Amount', value: `₹${pendingRevenue.toLocaleString()}` },
        { label: 'Collection %', value: `${paidPercentage}%` },
      ],
      invoiceCount: filteredInvoices.length,
    };
  };

  const calculatePaymentReport = () => {
    const filteredPayments = payments.filter(pay => filterByDateRange(pay.payment_date));
    const totalPayments = filteredPayments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const avgPayment = filteredPayments.length > 0 ? (totalPayments / filteredPayments.length).toFixed(2) : 0;

    return {
      title: 'Payment Report',
      metrics: [
        { label: 'Total Payments', value: `₹${totalPayments.toLocaleString()}` },
        { label: 'Payment Count', value: filteredPayments.length },
        { label: 'Average Payment', value: `₹${Number(avgPayment).toLocaleString()}` },
        { label: 'Date Range', value: format(getDateRangeFilter(), 'dd MMM yyyy') },
      ],
      paymentCount: filteredPayments.length,
    };
  };

  const calculateOrderReport = () => {
    const filteredOrders = orders;
    const totalOrderValue = filteredOrders.reduce((sum, order) => sum + (order.net_amount || 0), 0);
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
    const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered').length;

    return {
      title: 'Order Report',
      metrics: [
        { label: 'Total Order Value', value: `₹${totalOrderValue.toLocaleString()}` },
        { label: 'Total Orders', value: filteredOrders.length },
        { label: 'Pending Orders', value: pendingOrders },
        { label: 'Delivered Orders', value: deliveredOrders },
      ],
      orderCount: filteredOrders.length,
    };
  };

  const getCurrentReport = () => {
    switch (reportType) {
      case 'revenue':
        return calculateRevenueReport();
      case 'payment':
        return calculatePaymentReport();
      case 'order':
        return calculateOrderReport();
      default:
        return calculateRevenueReport();
    }
  };

  const report = getCurrentReport();

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const reportData = [
      {
        ReportType: report.title,
        DateRange: dateRange,
        GeneratedDate: new Date().toISOString().split('T')[0],
        ...Object.fromEntries(report.metrics.map((m, i) => [`Metric_${i + 1}`, `${m.label}: ${m.value}`])),
      },
    ];

    const columns = [
      { key: 'ReportType' as const, label: 'Report Type' },
      { key: 'DateRange' as const, label: 'Date Range' },
      { key: 'GeneratedDate' as const, label: 'Generated Date' },
    ];

    switch (format) {
      case 'csv':
        exportToCSV(reportData, `${report.title.replace(/\s+/g, '_')}_${dateRange}`, columns);
        break;
      case 'excel':
        exportToExcel(reportData, `${report.title.replace(/\s+/g, '_')}_${dateRange}`, columns);
        break;
      case 'pdf':
        exportToPDF(reportData, `${report.title.replace(/\s+/g, '_')}_${dateRange}`, columns, report.title);
        break;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Finance Reports</h1>
        <p className="text-muted-foreground mt-1">View comprehensive financial reports and analytics</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Report Type</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue Report</SelectItem>
              <SelectItem value="payment">Payment Report</SelectItem>
              <SelectItem value="order">Order Report</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.metrics.map((metric, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Export Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Export Report</CardTitle>
          <CardDescription>Download report in your preferred format</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </Button>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Report Type:</span>
              <span className="ml-2 font-semibold">{report.title}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Period:</span>
              <span className="ml-2 font-semibold capitalize">{dateRange}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Generated:</span>
              <span className="ml-2 font-semibold">{format(new Date(), 'dd MMM yyyy HH:mm')}</span>
            </p>
            {reportType === 'revenue' && 'invoiceCount' in report && (
              <p>
                <span className="text-muted-foreground">Invoices:</span>
                <span className="ml-2 font-semibold">{(report as any).invoiceCount}</span>
              </p>
            )}
            {reportType === 'payment' && 'paymentCount' in report && (
              <p>
                <span className="text-muted-foreground">Payments:</span>
                <span className="ml-2 font-semibold">{(report as any).paymentCount}</span>
              </p>
            )}
            {reportType === 'order' && 'orderCount' in report && (
              <p>
                <span className="text-muted-foreground">Orders:</span>
                <span className="ml-2 font-semibold">{(report as any).orderCount}</span>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
