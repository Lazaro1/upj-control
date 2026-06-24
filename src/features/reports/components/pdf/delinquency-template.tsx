import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

interface DelinquencySummaryRow {
  memberName: string;
  overdueCount: number;
  totalOpenAmount: number;
  oldestDueDate: string;
}

interface DelinquencyDetailRow {
  memberName: string;
  chargeTypeName: string;
  dueDate: string;
  openAmount: number;
  daysOverdue: number;
}

interface DelinquencyTemplateProps {
  subtitle: string;
  generatedAt: string;
  summaries: DelinquencySummaryRow[];
  details: DelinquencyDetailRow[];
  totals: {
    members: number;
    overdueCharges: number;
    totalOpenAmount: number;
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#111827'
  },
  header: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 10
  },
  title: {
    fontSize: 14,
    fontWeight: 700
  },
  subtitle: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2
  },
  generatedAt: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 2
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  metricBox: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    padding: 8
  },
  metricLabel: {
    fontSize: 8,
    color: '#6B7280'
  },
  metricValue: {
    marginTop: 2,
    fontWeight: 700
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 10,
    fontWeight: 700
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 6
  },
  tableRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderTopWidth: 0,
    paddingVertical: 5,
    paddingHorizontal: 6
  },
  cellText: {
    fontSize: 8
  }
});

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function DelinquencyTemplate({
  subtitle,
  generatedAt,
  summaries,
  details,
  totals
}: DelinquencyTemplateProps) {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatorio de Inadimplencia</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <Text style={styles.generatedAt}>Gerado em: {generatedAt}</Text>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Irmaos inadimplentes</Text>
            <Text style={styles.metricValue}>{totals.members}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Cobrancas vencidas</Text>
            <Text style={styles.metricValue}>{totals.overdueCharges}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Total em aberto</Text>
            <Text style={styles.metricValue}>
              {formatCurrency(totals.totalOpenAmount)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Consolidado por irmao</Text>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.cellText, { width: '36%' }]}>Irmao</Text>
          <Text style={[styles.cellText, { width: '18%', textAlign: 'right' }]}>
            Qtd.
          </Text>
          <Text style={[styles.cellText, { width: '24%', textAlign: 'right' }]}>
            Total aberto
          </Text>
          <Text style={[styles.cellText, { width: '22%' }]}>Mais antiga</Text>
        </View>
        {summaries.map((summary, index) => (
          <View style={styles.tableRow} key={`summary-${index}`}>
            <Text style={[styles.cellText, { width: '36%' }]}>
              {summary.memberName}
            </Text>
            <Text
              style={[styles.cellText, { width: '18%', textAlign: 'right' }]}
            >
              {summary.overdueCount}
            </Text>
            <Text
              style={[styles.cellText, { width: '24%', textAlign: 'right' }]}
            >
              {formatCurrency(summary.totalOpenAmount)}
            </Text>
            <Text style={[styles.cellText, { width: '22%' }]}>
              {formatDate(summary.oldestDueDate)}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Detalhado por cobranca</Text>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.cellText, { width: '30%' }]}>Irmao</Text>
          <Text style={[styles.cellText, { width: '24%' }]}>Tipo</Text>
          <Text style={[styles.cellText, { width: '16%' }]}>Vencimento</Text>
          <Text style={[styles.cellText, { width: '14%', textAlign: 'right' }]}>
            Atraso
          </Text>
          <Text style={[styles.cellText, { width: '16%', textAlign: 'right' }]}>
            Aberto
          </Text>
        </View>
        {details.map((detail, index) => (
          <View style={styles.tableRow} key={`detail-${index}`}>
            <Text style={[styles.cellText, { width: '30%' }]}>
              {detail.memberName}
            </Text>
            <Text style={[styles.cellText, { width: '24%' }]}>
              {detail.chargeTypeName}
            </Text>
            <Text style={[styles.cellText, { width: '16%' }]}>
              {formatDate(detail.dueDate)}
            </Text>
            <Text
              style={[styles.cellText, { width: '14%', textAlign: 'right' }]}
            >
              {detail.daysOverdue} dias
            </Text>
            <Text
              style={[styles.cellText, { width: '16%', textAlign: 'right' }]}
            >
              {formatCurrency(detail.openAmount)}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
