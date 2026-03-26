import React from 'react';
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#333'
  },
  header: {
    borderBottom: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  subTitle: {
    fontSize: 10,
    color: '#666'
  },
  section: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#CCC',
    padding: 10,
    borderRadius: 2
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#EEE',
    padding: 4,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  gridItem: {
    width: '33.33%',
    marginBottom: 8
  },
  label: {
    fontSize: 7,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  table: {
    marginTop: 10
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEE',
    paddingVertical: 4
  },
  col1: { width: '15%' },
  col2: { width: '40%' },
  col3: { width: '15%', textAlign: 'center' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '15%', textAlign: 'right' },
  
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#999',
    borderTopWidth: 0.5,
    borderTopColor: '#CCC',
    paddingTop: 10
  }
});

interface FichaVisualProps {
  member: {
    fullName: string;
    email: string;
    phone?: string | null;
    status: string;
    joinedAt?: string | null;
    creditBalance: number;
    notesInternal?: string | null;
  };
  entries: any[];
  generatedAt: string;
}

export const FichaVisualTemplate = ({ member, entries, generatedAt }: FichaVisualProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Ficha Financeira do Irmão</Text>
          <Text style={styles.subTitle}>UPJ Control - Sistema de Gestão Maçônica</Text>
        </View>
        <Text style={{ fontSize: 8, color: '#999' }}>Emissão: {generatedAt}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados Cadastrais</Text>
        <View style={styles.grid}>
          <View style={[styles.gridItem, { width: '50%' }]}>
            <Text style={styles.label}>Nome Completo</Text>
            <Text style={styles.value}>{member.fullName}</Text>
          </View>
          <View style={[styles.gridItem, { width: '25%' }]}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{member.status.toUpperCase()}</Text>
          </View>
          <View style={[styles.gridItem, { width: '25%' }]}>
            <Text style={styles.label}>Iniciação / Filiação</Text>
            <Text style={styles.value}>
              {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('pt-BR') : 'N/A'}
            </Text>
          </View>
          <View style={[styles.gridItem, { width: '40%' }]}>
            <Text style={styles.label}>E-mail</Text>
            <Text style={styles.value}>{member.email}</Text>
          </View>
          <View style={[styles.gridItem, { width: '30%' }]}>
            <Text style={styles.label}>Telefone</Text>
            <Text style={styles.value}>{member.phone || 'Não informado'}</Text>
          </View>
          <View style={[styles.gridItem, { width: '30%' }]}>
            <Text style={styles.label}>Saldo Credor Atual</Text>
            <Text style={[styles.value, { color: member.creditBalance > 0 ? '#059669' : '#000' }]}>
              {member.creditBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
          </View>
        </View>
      </View>

      {member.notesInternal && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações Internas (Tesouraria)</Text>
          <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{member.notesInternal}</Text>
        </View>
      )}

      <View style={[styles.section, { flex: 1 }]}>
        <Text style={styles.sectionTitle}>Histórico de Movimentações (Últimos Lançamentos)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Data</Text>
            <Text style={styles.col2}>Descrição / Tipo</Text>
            <Text style={styles.col3}>Tipo</Text>
            <Text style={styles.col4}>Débito</Text>
            <Text style={styles.col5}>Crédito</Text>
          </View>
          {entries.slice(0, 20).map((entry, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{new Date(entry.date).toLocaleDateString('pt-BR')}</Text>
              <Text style={styles.col2}>{entry.description}</Text>
              <Text style={styles.col3}>{entry.type === 'charge' ? 'COB' : 'PAG'}</Text>
              <Text style={styles.col4}>
                {entry.type === 'charge' ? entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
              </Text>
              <Text style={styles.col5}>
                {entry.type === 'payment' ? entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
              </Text>
            </View>
          ))}
        </View>
        {entries.length > 20 && (
          <Text style={{ marginTop: 10, fontSize: 8, color: '#999', textAlign: 'center' }}>
            * Exibindo apenas os últimos 20 lançamentos. Para o histórico completo, emita o Extrato Individual.
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text>Este documento é para uso interno da Loja e conferência do Irmão.</Text>
        <Text>UPJ Control - Desenvolvido para a Maçonaria</Text>
      </View>
    </Page>
  </Document>
);
