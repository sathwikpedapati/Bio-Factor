import { format } from 'date-fns';

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[]
) {
  const headers = columns.map(col => col.label).join(',');
  const rows = data.map(row =>
    columns.map(col => {
      const value = row[col.key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',')
  );
  
  const csv = [headers, ...rows].join('\n');
  downloadFile(csv, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
}

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[]
) {
  // Create a simple HTML table that Excel can open
  const headers = columns.map(col => `<th>${col.label}</th>`).join('');
  const rows = data.map(row =>
    `<tr>${columns.map(col => {
      const value = row[col.key];
      if (value === null || value === undefined) return '<td></td>';
      if (typeof value === 'object') return `<td>${JSON.stringify(value)}</td>`;
      return `<td>${value}</td>`;
    }).join('')}</tr>`
  ).join('');
  
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head><meta charset="UTF-8"></head>
    <body><table border="1"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></body>
    </html>
  `;
  
  downloadFile(html, `${filename}_${format(new Date(), 'yyyy-MM-dd')}.xls`, 'application/vnd.ms-excel');
}

export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: { key: keyof T; label: string }[],
  title: string
) {
  // Create a printable HTML page
  const headers = columns.map(col => `<th style="border:1px solid #000;padding:8px;background:#f0f0f0;">${col.label}</th>`).join('');
  const rows = data.map(row =>
    `<tr>${columns.map(col => {
      const value = row[col.key];
      if (value === null || value === undefined) return '<td style="border:1px solid #000;padding:8px;"></td>';
      if (typeof value === 'object') return `<td style="border:1px solid #000;padding:8px;">${JSON.stringify(value)}</td>`;
      return `<td style="border:1px solid #000;padding:8px;">${value}</td>`;
    }).join('')}</tr>`
  ).join('');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; margin-bottom: 10px; }
        p { color: #666; margin-bottom: 20px; }
        table { border-collapse: collapse; width: 100%; }
        @media print { body { -webkit-print-color-adjust: exact; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on ${format(new Date(), 'PPpp')}</p>
      <table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
