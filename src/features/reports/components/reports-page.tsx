'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { format, startOfMonth } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { REPORT_TABS, type ReportsTabValue } from './report-tab-options';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { IconDownload, IconFileTypePdf } from '@tabler/icons-react';
import { ReportFilters } from './report-filters';
import { DelinquencyReportFilters } from './delinquency-report-filters';
import { IncomeReportTable } from './income-report-table';
import { ExpenseReportTable } from './expense-report-table';
import { ConsolidatedBalanceCard } from './consolidated-balance-card';
import { ReceiptsByTypeChart } from './receipts-by-type-chart';
import { MemberPositionTable } from './member-position-table';
import { DelinquencyReportTable } from './delinquency-report-table';
import {
  getConsolidatedBalance,
  getDelinquencyChargeTypeOptions,
  getDelinquencyReport,
  getExpenseReport,
  getIncomeReport,
  getMemberFinancialPosition,
  getReceiptsByChargeType,
  type DelinquencyReportData
} from '../server/report.actions';



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

interface DelinquencyChargeTypeOption {
  id: string;
  name: string;
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

  const [delinquencyData, setDelinquencyData] =
    useState<DelinquencyReportData | null>(null);
  const [delinquencyError, setDelinquencyError] = useState<string | null>(null);
  const [delinquencyExportError, setDelinquencyExportError] = useState<
    string | null
  >(null);
  const [isExportingDelinquency, setIsExportingDelinquency] = useState(false);
  const [delinquencyFilterOptions, setDelinquencyFilterOptions] = useState<
    DelinquencyChargeTypeOption[]
  >([]);
  const [delinquencyFilters, setDelinquencyFilters] = useState(() => ({
    dueDateFrom: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    dueDateTo: format(new Date(), 'yyyy-MM-dd'),
    chargeTypeId: undefined as string | undefined
  }));

  useEffect(() => {
    async function loadChargeTypeOptions() {
      const response = await getDelinquencyChargeTypeOptions();
      if (response.success && response.data) {
        setDelinquencyFilterOptions(response.data);
      }
    }

    void loadChargeTypeOptions();
  }, []);

  function clearData(): void {
    setIncomeData(null);
    setExpenseData(null);
    setBalanceData(null);
    setReceiptsByTypeData(null);
    setMemberPositionData(null);
    setDelinquencyData(null);
    setDelinquencyError(null);
    setDelinquencyExportError(null);
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

  async function handleGenerateDelinquency(nextFilters: {
    dueDateFrom: string;
    dueDateTo: string;
    chargeTypeId: string | undefined;
  }): Promise<void> {
    setDelinquencyFilters(nextFilters);
    setDelinquencyError(null);
    setDelinquencyExportError(null);
    setIsLoading(true);

    try {
      const response = await getDelinquencyReport(nextFilters);
      if (response.success && response.data) {
        setDelinquencyData(response.data);
        setDelinquencyFilterOptions(response.data.chargeTypeOptions);
        return;
      }

      setDelinquencyData(null);
      setDelinquencyError(response.error || 'Falha ao carregar inadimplencia.');
    } finally {
      setIsLoading(false);
    }
  }

  function buildDownloadUrl(
    basePath: string,
    paramsInput: Record<string, string | undefined>
  ): string {
    const params = new URLSearchParams();

    Object.entries(paramsInput).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    return `${basePath}?${params.toString()}`;
  }

  async function downloadDelinquency(format: 'csv' | 'pdf') {
    setDelinquencyExportError(null);
    setIsExportingDelinquency(true);

    try {
      const endpoint =
        format === 'csv'
          ? '/api/reports/delinquency'
          : '/api/reports/delinquency/pdf';

      const url = buildDownloadUrl(endpoint, {
        dueDateFrom: delinquencyFilters.dueDateFrom,
        dueDateTo: delinquencyFilters.dueDateTo,
        chargeTypeId: delinquencyFilters.chargeTypeId
      });

      const response = await fetch(url);
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Falha ao exportar relatorio.');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download =
        format === 'csv'
          ? 'relatorio-inadimplencia.csv'
          : 'relatorio-inadimplencia.pdf';

      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      setDelinquencyExportError(
        error?.message || 'Falha ao exportar. Tente novamente.'
      );
    } finally {
      setIsExportingDelinquency(false);
    }
  }

  function handleTabChange(value: string): void {
    setActiveTab(value as ReportsTabValue);
    clearData();
  }

  function renderPlaceholder(): ReactElement {
    return (
      <div className='text-muted-foreground rounded-md border border-dashed p-10 text-center text-sm'>
        Selecione o periodo e clique em "Gerar Relatorio" para visualizar os
        dados.
      </div>
    );
  }

  function renderDelinquencyPlaceholder(): ReactElement {
    return (
      <div className='text-muted-foreground rounded-md border border-dashed p-10 text-center text-sm'>
        Configure os filtros de vencimento e clique em "Filtrar" para gerar o
        relatorio de inadimplencia.
      </div>
    );
  }

  function renderExportActions(): ReactElement | null {
    if (activeTab === 'income' && incomeData) {
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <Button asChild variant='outline' size='sm'>
            <a
              href={buildDownloadUrl('/api/reports/income', {
                dateFrom,
                dateTo
              })}
              target='_blank'
              download
            >
              <IconDownload className='mr-1 h-4 w-4' /> CSV
            </a>
          </Button>
          <Button asChild variant='outline' size='sm'>
            <a
              href={buildDownloadUrl('/api/reports/income/pdf', {
                dateFrom,
                dateTo
              })}
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
              href={buildDownloadUrl('/api/reports/expenses', {
                dateFrom,
                dateTo
              })}
              target='_blank'
              download
            >
              <IconDownload className='mr-1 h-4 w-4' /> CSV
            </a>
          </Button>
          <Button asChild variant='outline' size='sm'>
            <a
              href={buildDownloadUrl('/api/reports/expenses/pdf', {
                dateFrom,
                dateTo
              })}
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
              href={buildDownloadUrl('/api/reports/consolidated/pdf', {
                dateFrom,
                dateTo
              })}
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
              href={buildDownloadUrl('/api/reports/member-position', {
                dateFrom,
                dateTo
              })}
              target='_blank'
              download
            >
              <IconDownload className='mr-1 h-4 w-4' /> CSV
            </a>
          </Button>
        </div>
      );
    }

    if (activeTab === 'delinquency' && delinquencyData) {
      return (
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => void downloadDelinquency('csv')}
            disabled={isExportingDelinquency}
          >
            <IconDownload className='mr-1 h-4 w-4' /> CSV
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => void downloadDelinquency('pdf')}
            disabled={isExportingDelinquency}
          >
            <IconFileTypePdf className='mr-1 h-4 w-4' /> PDF
          </Button>
        </div>
      );
    }

    return null;
  }

  return (
    <div className='space-y-6'>
      {activeTab === 'delinquency' ? (
        <DelinquencyReportFilters
          chargeTypeOptions={delinquencyFilterOptions}
          isLoading={isLoading}
          initialDueDateFrom={delinquencyFilters.dueDateFrom}
          initialDueDateTo={delinquencyFilters.dueDateTo}
          initialChargeTypeId={delinquencyFilters.chargeTypeId}
          onFilter={(filters) => void handleGenerateDelinquency(filters)}
        />
      ) : (
        <ReportFilters onFilter={handleGenerate} isLoading={isLoading} />
      )}

      <div className='space-y-2 sm:hidden'>
        <label className='text-foreground text-sm font-medium'>
          Tipo de relatorio
        </label>
        <Select value={activeTab} onValueChange={handleTabChange}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Selecione um relatorio' />
          </SelectTrigger>
          <SelectContent>
            {REPORT_TABS.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className='space-y-4'
      >
        <TabsList className='hidden h-auto flex-wrap sm:flex'>
          {REPORT_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className='text-muted-foreground text-xs'>
          {activeTab === 'delinquency' ? (
            <>
              Vencimento atual: {delinquencyFilters.dueDateFrom || '--'} ate{' '}
              {delinquencyFilters.dueDateTo || '--'}
            </>
          ) : (
            <>
              Periodo atual: {dateFrom || '--'} ate {dateTo || '--'}
            </>
          )}
        </div>

        {renderExportActions()}

        {delinquencyExportError ? (
          <div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
            {delinquencyExportError}
          </div>
        ) : null}

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

        <TabsContent value='delinquency'>
          {isLoading ? (
            <div className='flex min-h-[220px] items-center justify-center'>
              <Icons.spinner className='text-muted-foreground h-6 w-6 animate-spin' />
            </div>
          ) : delinquencyError ? (
            <div className='space-y-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
              <p>{delinquencyError}</p>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  void handleGenerateDelinquency(delinquencyFilters)
                }
              >
                Tentar novamente
              </Button>
            </div>
          ) : delinquencyData ? (
            <DelinquencyReportTable
              summaries={delinquencyData.summaries}
              details={delinquencyData.details}
              totals={delinquencyData.totals}
            />
          ) : (
            renderDelinquencyPlaceholder()
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
