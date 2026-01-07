import Papa from 'papaparse';
import { parse as parseDate, isValid } from 'date-fns';
import { Transaction, ParsedCSV } from '../types';
import { categorizeTransaction, extractMerchantName } from './categorization';
import { v4 as uuidv4 } from './uuid';

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  date: string;
  amount: string;
  description: string;
  balance?: string;
}

const DATE_FORMATS = [
  'MM/dd/yyyy',
  'dd/MM/yyyy',
  'yyyy-MM-dd',
  'M/d/yyyy',
  'd/M/yyyy',
  'MM-dd-yyyy',
  'dd-MM-yyyy',
  'yyyy/MM/dd',
  'MMM dd, yyyy',
  'dd MMM yyyy',
  'MMMM dd, yyyy',
];

function detectDateColumn(headers: string[]): string | null {
  const dateKeywords = ['date', 'transaction date', 'posting date', 'trans date', 'datetime'];

  for (const keyword of dateKeywords) {
    const match = headers.find(h =>
      h.toLowerCase().includes(keyword)
    );
    if (match) return match;
  }

  return headers.find(h => /date/i.test(h)) || null;
}

function detectAmountColumn(headers: string[]): string | null {
  const amountKeywords = ['amount', 'transaction amount', 'debit', 'credit', 'value', 'sum'];

  for (const keyword of amountKeywords) {
    const match = headers.find(h =>
      h.toLowerCase().includes(keyword) && !h.toLowerCase().includes('balance')
    );
    if (match) return match;
  }

  return null;
}

function detectDescriptionColumn(headers: string[]): string | null {
  const descKeywords = ['description', 'memo', 'narrative', 'details', 'merchant', 'payee', 'name'];

  for (const keyword of descKeywords) {
    const match = headers.find(h =>
      h.toLowerCase().includes(keyword)
    );
    if (match) return match;
  }

  return null;
}

function detectBalanceColumn(headers: string[]): string | null {
  const balanceKeywords = ['balance', 'running balance', 'current balance'];

  for (const keyword of balanceKeywords) {
    const match = headers.find(h =>
      h.toLowerCase().includes(keyword)
    );
    if (match) return match;
  }

  return null;
}

function detectColumnMapping(headers: string[]): ColumnMapping | null {
  const date = detectDateColumn(headers);
  const amount = detectAmountColumn(headers);
  const description = detectDescriptionColumn(headers);
  const balance = detectBalanceColumn(headers);

  if (!date || !amount || !description) {
    return null;
  }

  return { date, amount, description, balance };
}

function parseAmount(value: string): number {
  // Remove currency symbols, commas, and spaces
  let cleaned = value.replace(/[$£€¥,\s]/g, '');

  // Handle parentheses as negative
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = '-' + cleaned.slice(1, -1);
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function parseDateString(dateStr: string): Date | null {
  // Try each date format
  for (const format of DATE_FORMATS) {
    try {
      const parsed = parseDate(dateStr, format, new Date());
      if (isValid(parsed)) {
        return parsed;
      }
    } catch {
      continue;
    }
  }

  // Try native Date parsing as fallback
  const nativeDate = new Date(dateStr);
  if (isValid(nativeDate)) {
    return nativeDate;
  }

  return null;
}

export function parseCSV(file: File): Promise<ParsedCSV> {
  return new Promise((resolve) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const errors: string[] = [];
        const transactions: Transaction[] = [];

        if (results.errors.length > 0) {
          errors.push(...results.errors.map(e => e.message));
        }

        if (!results.data || results.data.length === 0) {
          resolve({
            transactions: [],
            headers: results.meta.fields || [],
            errors: ['No data found in CSV file'],
            rowCount: 0,
          });
          return;
        }

        const headers = results.meta.fields || [];
        const mapping = detectColumnMapping(headers);

        if (!mapping) {
          resolve({
            transactions: [],
            headers,
            errors: ['Could not detect required columns (date, amount, description). Please ensure your CSV has these fields.'],
            rowCount: results.data.length,
          });
          return;
        }

        let rowIndex = 0;
        for (const row of results.data) {
          rowIndex++;

          const dateStr = row[mapping.date]?.trim();
          const amountStr = row[mapping.amount]?.trim();
          const description = row[mapping.description]?.trim();

          if (!dateStr || !amountStr || !description) {
            errors.push(`Row ${rowIndex}: Missing required fields`);
            continue;
          }

          const date = parseDateString(dateStr);
          if (!date) {
            errors.push(`Row ${rowIndex}: Invalid date format: ${dateStr}`);
            continue;
          }

          const amount = parseAmount(amountStr);
          if (amount === 0 && amountStr !== '0') {
            errors.push(`Row ${rowIndex}: Invalid amount: ${amountStr}`);
            continue;
          }

          const merchant = extractMerchantName(description);
          const category = categorizeTransaction(description);

          const transaction: Transaction = {
            id: uuidv4(),
            date,
            description,
            amount,
            category,
            merchant,
            originalCategory: category,
            userModified: false,
          };

          if (mapping.balance && row[mapping.balance]) {
            const balance = parseAmount(row[mapping.balance]);
            if (!isNaN(balance)) {
              transaction.balance = balance;
            }
          }

          transactions.push(transaction);
        }

        // Sort by date (newest first)
        transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

        resolve({
          transactions,
          headers,
          errors,
          rowCount: results.data.length,
        });
      },
      error: (error) => {
        resolve({
          transactions: [],
          headers: [],
          errors: [`Failed to parse CSV: ${error.message}`],
          rowCount: 0,
        });
      },
    });
  });
}

export function validateCSVStructure(headers: string[]): { valid: boolean; message: string } {
  const mapping = detectColumnMapping(headers);

  if (!mapping) {
    return {
      valid: false,
      message: 'Could not detect required columns. Please ensure your CSV has: Date, Amount, and Description columns.',
    };
  }

  return {
    valid: true,
    message: `Detected columns - Date: "${mapping.date}", Amount: "${mapping.amount}", Description: "${mapping.description}"${mapping.balance ? `, Balance: "${mapping.balance}"` : ''}`,
  };
}
