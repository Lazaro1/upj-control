import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

interface ReportColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  width: string;
}

interface ReportSummaryItem {
  label: string;
  value: string;
}

interface ReportTemplateProps {
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
  summary?: ReportSummaryItem[];
  generatedAt: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 20
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  reportTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right'
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 4,
    marginBottom: 25,
    gap: 20
  },
  summaryItem: {
    flex: 1
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 8,
    textTransform: 'uppercase',
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomColor: '#EEE',
    borderBottomWidth: 1,
    paddingVertical: 8,
    alignItems: 'center'
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: 1,
    borderTopColor: '#EEE',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#999',
    fontSize: 8
  }
});

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function renderCellValue(value: string | number): string {
  if (typeof value === 'number') {
    return formatCurrency(value);
  }

  const parsedDate = new Date(value);
  if (!Number.isNaN(parsedDate.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return formatDate(value);
  }

  return value;
}

export function ReportTemplate({
  title,
  subtitle,
  columns,
  rows,
  summary,
  generatedAt
}: ReportTemplateProps) {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>UPJ Control</Text>
            <Text style={{ color: '#666' }}>Sistema de Tesouraria</Text>
          </View>
          <View>
            <Text style={styles.reportTitle}>{title}</Text>
            {subtitle ? (
              <Text style={{ textAlign: 'right', color: '#666', fontSize: 9 }}>
                {subtitle}
              </Text>
            ) : null}
            <Text style={{ textAlign: 'right', color: '#999', fontSize: 8 }}>
              Gerado em: {generatedAt}
            </Text>
          </View>
        </View>

        <View style={[styles.tableRow, styles.tableHeader]}>
          {columns.map((column) => (
            <Text
              key={column.key}
              style={{
                width: column.width,
                textAlign: column.align || 'left',
                fontWeight: 'bold'
              }}
            >
              {column.label}
            </Text>
          ))}
        </View>

        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.tableRow}>
            {columns.map((column) => (
              <Text
                key={`${rowIndex}-${column.key}`}
                style={{
                  width: column.width,
                  textAlign: column.align || 'left'
                }}
              >
                {renderCellValue(row[column.key] ?? '')}
              </Text>
            ))}
          </View>
        ))}

        {summary && summary.length > 0 ? (
          <View style={styles.summaryContainer}>
            {summary.map((item) => (
              <View key={item.label} style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text style={styles.summaryValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text>UPJ Control - Gestão de Tesouraria Maçônica</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
            fixed
          />
        </View>
      </Page>
    </Document>
  );
}
