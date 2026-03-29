'use client';

import { useState, type ReactElement } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { IconDownload, IconFileTypePdf } from '@tabler/icons-react';
import { ReportFilters } from './report-filters';
import { IncomeReportTable } from './income-report-table';
import { ExpenseReportTable } from './expense-report-table';
import { ConsolidatedBalanceCard } from './consolidated-balance-card';
import { ReceiptsByTypeChart } from './receipts-by-type-chart';
import { MemberPositionTable } from './member-position-table';
import {
  getConsolidatedBalance,
  getExpenseReport,
  getIncomeReport,
  getMemberFinancialPosition,
  getReceiptsByChargeType
} from '../server/report.actions';

type ReportsTabValue =
  | 'income'
  | 'expenses'
  | 'balance'
  | 'by-charge-type'
  | 'member-position';

interface IncomeData {
  paymentEntries: Array<{ source: string; total: number }>;
  cashEntries: Array<{ source: string; total: number }>;
  grandTotal: number;
}

interface ExpenseData {
  expenses: Array<{ category: string; total: number }>;
  grandTotal: number;
}

interface BalanceData {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
}

interface ReceiptsByTypeData {
  chargeTypeName: string;
  total: number;
  count: number;
}

interface MemberPositionData {
  memberId: string;
  memberName: string;
  totalCharged: number;
  totalPaid: number;
  balance: number;
}

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportsTabValue>('income');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [incomeData, setIncomeData] = useState<IncomeData | null>(null);
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [receiptsByTypeData, setReceiptsByTypeData] = useState<
    ReceiptsByTypeData[] | null
  >(null);
  const [memberPositionData, setMemberPositionData] = useState<
    MemberPositionData[] | null
  >(null);

  function clearData(): void {
    setIncomeData(null);
    setExpenseData(null);
    setBalanceData(null);
    setReceiptsByTypeData(null);
    setMemberPositionData(null);
  }

  async function handleGenerate(
    nextDateFrom: string,
    nextDateTo: string
  ): Promise<void> {
    setDateFrom(nextDateFrom);
    setDateTo(nextDateTo);
    setIsLoading(true);

    try {
      if (activeTab === 'income') {
        const response = await getIncomeReport(nextDateFrom, nextDateTo);
        if (response.success && response.data) {
          setIncomeData(response.data as IncomeData);
        }
      }

      if (activeTab === 'expenses') {
        const response = await getExpenseReport(nextDateFrom, nextDateTo);
        if (response.success && response.data) {
          setExpenseData(response.data as ExpenseData);
        }
      }

      if (activeTab === 'balance') {
        const response = await getConsolidatedBalance(nextDateFrom, nextDateTo);
        if (response.success && response.data) {
          setBalanceData(response.data as BalanceData);
        }
      }

      if (activeTab === 'by-charge-type') {
        const response = await getReceiptsByChargeType(
          nextDateFrom,
          nextDateTo
        );
        if (response.success && response.data) {
          setReceiptsByTypeData(response.data as ReceiptsByTypeData[]);
        }
      }

      if (activeTab === 'member-position') {
        const response = await getMemberFinancialPosition(
          nextDateFrom,
          nextDateTo
        );
        if (response.success && response.data) {
          setMemberPositionData(response.data as MemberPositionData[]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleTabChange(value: string): void {
    setActiveTab(value as ReportsTabValue);
    clearData();
  }

  function renderPlaceholder(): ReactElement {
    return (
      <div className='text-muted-foreground rounded-md border border-dashed p-10 text-center text-sm'>
        Selecione o período e clique em "Gerar Relatório" para visualizar os
        dados.
      </div>
    );
  }

  function buildDownloadUrl(basePath: string): string {
    const params = new URLSearchParams();
    params.set('dateFrom', dateFrom);
    params.set('dateTo', dateTo);
    return `${basePath}?${params.toString()}`;
  }

  function renderExportActions(): ReactElement | null {
    if (activeTab === 'income' && incomeData) {
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <Button asChild variant='outline' size='sm'>
            <a
              href={buildDownloadUrl('/api/reports/income')}
              target='_blank'
              download
            >
              <IconDownload className='mr-1 h-4 w-4' /> CSV
            </a>
          </Button>
          <Button asChild variant='outline' size='sm'>
            <a
              href={buildDownloadUrl('/api/reports/income/pdf')}
              target='_blank'
              download
            >
              <IconFileTypePdf className='mr-1 h-4 w-4' /> PDF
            </a>
          </Button>
        </div>
      );
    }

    if (activeTab === 'expenses' && expenseData) {
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <Button asChild variant='outline' size='sm'>
            <a
              href={buildDownloadUrl('/api/reports/expenses')}
              target='_blank'
              download
            >
              <IconDownload className='mr-1 h-4 w-4' /> CSV
            </a>
          </Button>
          <Button asChild variant='outline' size='sm'>
            <a
              href={buildDownloadUrl('/api/reports/expenses/pdf')}
              target='_blank'
              download
            >
              <IconFileTypePdf className='mr-1 h-4 w-4' /> PDF
            </a>
          </Button>
        </div>
      );
    }

    if (activeTab === 'balance' && balanceData) {
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <Button asChild variant='outline' size='sm'>
            <a
              href={buildDownloadUrl('/api/reports/consolidated/pdf')}
              target='_blank'
              download
            >
              <IconFileTypePdf className='mr-1 h-4 w-4' /> PDF
            </a>
          </Button>
        </div>
      );
    }

    if (activeTab === 'member-position' && memberPositionData) {
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <Button asChild variant='outline' size='sm'>
            <a
              href={buildDownloadUrl('/api/reports/member-position')}
              target='_blank'
              download
            >
              <IconDownload className='mr-1 h-4 w-4' /> CSV
            </a>
          </Button>
        </div>
      );
    }

    return null;
  }

  return (
    <div className='space-y-6'>
      <ReportFilters onFilter={handleGenerate} isLoading={isLoading} />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className='space-y-4'
      >
        <TabsList className='h-auto flex-wrap'>
          <TabsTrigger value='income'>Entradas</TabsTrigger>
          <TabsTrigger value='expenses'>Saídas</TabsTrigger>
          <TabsTrigger value='balance'>Saldo</TabsTrigger>
          <TabsTrigger value='by-charge-type'>Por Tipo de Cobrança</TabsTrigger>
          <TabsTrigger value='member-position'>Posição Individual</TabsTrigger>
        </TabsList>

        <div className='text-muted-foreground text-xs'>
          Período atual: {dateFrom || '--'} até {dateTo || '--'}
        </div>

        {renderExportActions()}

        <TabsContent value='income'>
          {isLoading ? (
            <div className='flex min-h-[220px] items-center justify-center'>
              <Icons.spinner className='text-muted-foreground h-6 w-6 animate-spin' />
            </div>
          ) : incomeData ? (
            <IncomeReportTable data={incomeData} />
          ) : (
            renderPlaceholder()
          )}
        </TabsContent>

        <TabsContent value='expenses'>
          {isLoading ? (
            <div className='flex min-h-[220px] items-center justify-center'>
              <Icons.spinner className='text-muted-foreground h-6 w-6 animate-spin' />
            </div>
          ) : expenseData ? (
            <ExpenseReportTable data={expenseData} />
          ) : (
            renderPlaceholder()
          )}
        </TabsContent>

        <TabsContent value='balance'>
          {isLoading ? (
            <div className='flex min-h-[220px] items-center justify-center'>
              <Icons.spinner className='text-muted-foreground h-6 w-6 animate-spin' />
            </div>
          ) : balanceData ? (
            <ConsolidatedBalanceCard data={balanceData} />
          ) : (
            renderPlaceholder()
          )}
        </TabsContent>

        <TabsContent value='by-charge-type'>
          {isLoading ? (
            <div className='flex min-h-[220px] items-center justify-center'>
              <Icons.spinner className='text-muted-foreground h-6 w-6 animate-spin' />
            </div>
          ) : receiptsByTypeData ? (
            <ReceiptsByTypeChart data={receiptsByTypeData} />
          ) : (
            renderPlaceholder()
          )}
        </TabsContent>

        <TabsContent value='member-position'>
          {isLoading ? (
            <div className='flex min-h-[220px] items-center justify-center'>
              <Icons.spinner className='text-muted-foreground h-6 w-6 animate-spin' />
            </div>
          ) : memberPositionData ? (
            <MemberPositionTable data={memberPositionData} />
          ) : (
            renderPlaceholder()
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
