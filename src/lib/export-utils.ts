/**
 * CSV Export Utility for SOVEREIGN Debt Tracker
 * Converts transaction data to CSV format for download
 */

interface Transaction {
  id: string;
  type: string;
  name: string;
  amount: number;
  cleared: boolean;
  createdAt: number;
  note?: string;
  contact?: string;
  dueDate?: string;
  returnsPercentage?: number;
  payments?: Array<{
    id: string;
    amount: number;
    date: number;
    note?: string;
  }>;
}

/**
 * Convert transactions to CSV format
 */
export function generateCSV(transactions: Transaction[]): string {
  // CSV Headers
  const headers = [
    'Date Added',
    'Type',
    'Name',
    'Total Amount',
    'Payments Made',
    'Remaining',
    'Status',
    'Due Date',
    'Contact',
    'Returns %',
    'Notes'
  ];

  // CSV Rows
  const rows = transactions.map(t => {
    const totalPaid = t.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const remaining = t.amount - totalPaid;

    return [
      new Date(t.createdAt || Date.now()).toLocaleDateString(),
      t.type === 'credit' ? 'Incoming' : 'Outgoing',
      escapeCSV(t.name),
      t.amount.toFixed(2),
      totalPaid.toFixed(2),
      remaining.toFixed(2),
      t.cleared ? 'Settled' : 'Active',
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
      escapeCSV(t.contact || ''),
      t.returnsPercentage?.toString() || '',
      escapeCSV(t.note || '')
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Escape special characters for CSV
 */
function escapeCSV(value: string): string {
  if (!value) return '';

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'transactions.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    // Create download link
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  }
}

/**
 * Export transactions to CSV
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  filename?: string
): void {
  const csv = generateCSV(transactions);
  const defaultFilename = `sovereign-transactions-${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename || defaultFilename);
}
