import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image
} from '@react-pdf/renderer';
import { StatementEntry } from '@/features/statements/server/statement.actions';

// Register fonts if needed. Using standard Helvetica for now.

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
  memberInfo: {
    marginBottom: 20
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
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
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0
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
  colDate: { width: '15%' },
  colDesc: { width: '45%' },
  colType: { width: '15%', textAlign: 'center' },
  colAmount: { width: '25%', textAlign: 'right' },
  
  textNegative: { color: '#DC2626' },
  textPositive: { color: '#059669' },
  
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

interface StatementTemplateProps {
  memberName: string;
  creditBalance: number;
  totalCharged: number;
  totalPaid: number;
  pendingAmount: number;
  entries: StatementEntry[];
  generatedAt: string;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

export const StatementTemplate = ({
  memberName,
  creditBalance,
  totalCharged,
  totalPaid,
  pendingAmount,
  entries,
  generatedAt
}: StatementTemplateProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandName}>UPJ Control</Text>
          <Text style={{ color: '#666' }}>Sistema de Tesouraria</Text>
        </View>
        <View>
          <Text style={styles.reportTitle}>Extrato Financeiro Individual</Text>
          <Text style={{ textAlign: 'right', color: '#999', fontSize: 8 }}>
            Gerado em: {generatedAt}
          </Text>
        </View>
      </View>

      {/* Member Info */}
      <View style={styles.memberInfo}>
        <Text style={{ color: '#666', fontSize: 8, textTransform: 'uppercase' }}>Irmão</Text>
        <Text style={styles.memberName}>{memberName}</Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Cobrado</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalCharged)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Pago</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalPaid)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Pendência Atual</Text>
          <Text style={[styles.summaryValue, pendingAmount > 0 ? styles.textNegative : {}]}>
            {formatCurrency(pendingAmount)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Saldo em Crédito</Text>
          <Text style={[styles.summaryValue, creditBalance > 0 ? styles.textPositive : {}]}>
            {formatCurrency(creditBalance)}
          </Text>
        </View>
      </View>

      {/* Table Header */}
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.colDate, { fontWeight: 'bold' }]}>Data</Text>
        <Text style={[styles.colDesc, { fontWeight: 'bold' }]}>Descrição</Text>
        <Text style={[styles.colType, { fontWeight: 'bold' }]}>Tipo</Text>
        <Text style={[styles.colAmount, { fontWeight: 'bold' }]}>Valor</Text>
      </View>

      {/* Table Body */}
      {entries.map((entry, index) => (
        <View key={entry.id || index} style={styles.tableRow}>
          <Text style={styles.colDate}>{formatDate(entry.date)}</Text>
          <Text style={styles.colDesc}>{entry.description}</Text>
          <Text style={styles.colType}>
            {entry.type === 'charge' ? 'Débito' : 'Crédito'}
          </Text>
          <Text style={[
            styles.colAmount,
            entry.type === 'charge' ? styles.textNegative : styles.textPositive
          ]}>
            {entry.type === 'charge' ? '-' : '+'} {formatCurrency(entry.amount)}
          </Text>
        </View>
      ))}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>UPJ Control - Gestão de Tesouraria Maçônica</Text>
        <Text render={({ pageNumber, totalPages }) => (
          `Página ${pageNumber} de ${totalPages}`
        )} fixed />
      </View>
    </Page>
  </Document>
);
