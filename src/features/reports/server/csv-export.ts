import { NextResponse } from 'next/server';

interface CSVHeader {
  key: string;
  label: string;
}

function sanitizeForExcel(value: string): string {
  const startsWithFormulaToken = /^[=+\-@]/.test(value);
  const startsWithControlChar = /^[\u0000-\u001F\u007F]/.test(value);
  const hasLeadingWhitespaceBeforeFormula = /^\s+[=+\-@]/.test(value);

  if (
    startsWithFormulaToken ||
    startsWithControlChar ||
    hasLeadingWhitespaceBeforeFormula
  ) {
    return `'${value}`;
  }

  return value;
}

function formatCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'number') {
    return value.toFixed(2).replace('.', ',');
  }

  if (typeof value === 'string') {
    return sanitizeForExcel(value);
  }

  return String(value);
}

function escapeCSVField(value: string): string {
  if (
    value.includes(';') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function arrayToCSV(
  headers: CSVHeader[],
  rows: Record<string, unknown>[]
): string {
  const headerLine = headers
    .map((header) => escapeCSVField(header.label))
    .join(';');

  const bodyLines = rows.map((row) => {
    return headers
      .map((header) => {
        const formatted = formatCSVValue(row[header.key]);
        return escapeCSVField(formatted);
      })
      .join(';');
  });

  return `\uFEFF${[headerLine, ...bodyLines].join('\n')}`;
}

export function csvResponse(
  csvContent: string,
  filename: string
): NextResponse {
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}
