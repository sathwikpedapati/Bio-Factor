import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Sheet, Printer } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export';

export interface ExportData {
  id: string;
  [key: string]: any;
}

interface ExportControlsProps {
  data: ExportData[];
  filename?: string;
  columns?: Array<{
    key: string;
    label: string;
  }>;
  onExportStart?: () => void;
  onExportComplete?: () => void;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  data,
  filename = 'sales_report',
  columns,
  onExportStart,
  onExportComplete,
}) => {
  const defaultColumns = columns || (data.length > 0
    ? Object.keys(data[0]).map((key) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
      }))
    : []);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    onExportStart?.();
    
    try {
      switch (format) {
        case 'csv':
          exportToCSV(data, filename, defaultColumns);
          break;
        case 'excel':
          exportToExcel(data, filename, defaultColumns);
          break;
        case 'pdf':
          exportToPDF(
            data,
            filename,
            defaultColumns,
            filename.replace(/_/g, ' ').toUpperCase()
          );
          break;
      }
    } finally {
      onExportComplete?.();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileText className="w-4 h-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            <Sheet className="w-4 h-4 mr-2" />
            Export as Excel
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="w-4 h-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick Export Buttons */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('csv')}
        title="Quick export as CSV"
        className="border-primary/20 hover:bg-primary/5 text-primary"
      >
        <Download className="w-4 h-4" />
        CSV
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('pdf')}
        title="Quick export as PDF"
        className="border-primary/20 hover:bg-primary/5 text-primary"
      >
        <Download className="w-4 h-4" />
        PDF
      </Button>
    </div>
  );
};
