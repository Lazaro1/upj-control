import PageContainer from '@/components/layout/page-container';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { resolveDashboardLanding } from '@/lib/auth/landing';
import {
  getDashboardKPIs,
  getDashboardCharts,
  getDashboardAlerts,
  getTopOverdue,
  getRecentPayments,
  getDashboardPeriodStatus
} from '@/features/overview/server/dashboard.actions';
import DashboardKPICards from '@/features/overview/components/dashboard-kpi-cards';
import DashboardAlerts from '@/features/overview/components/dashboard-alerts';
import DashboardAreaChart from '@/features/overview/components/dashboard-area-chart';
import DashboardBarChart from '@/features/overview/components/dashboard-bar-chart';
import DashboardPieChart from '@/features/overview/components/dashboard-pie-chart';
import DashboardOverdueChart from '@/features/overview/components/dashboard-overdue-chart';
import DashboardTopOverdue from '@/features/overview/components/dashboard-top-overdue';
import DashboardRecentPayments from '@/features/overview/components/dashboard-recent-payments';
import { Badge } from '@/components/ui/badge';
import { IconLock } from '@tabler/icons-react';

export const metadata = {
  title: 'Dashboard: Visão Geral'
};

export const dynamic = 'force-dynamic';

const MONTH_NAMES = [
  '',
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

export default async function OverviewPage() {
  const { userId, orgId, orgRole } = await auth();
  if (!orgId) redirect('/auth/sign-in');
  if (orgRole === 'org:member') {
    const landing = await resolveDashboardLanding({ userId, orgRole });
    redirect(landing);
  }

  const user = await currentUser();
  const firstName = user?.firstName || user?.username || 'Usuário';

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Fetch all data in parallel
  const [kpis, charts, alerts, topOverdue, recentPayments, periodStatus] =
    await Promise.all([
      getDashboardKPIs(currentMonth, currentYear),
      getDashboardCharts(currentMonth, currentYear),
      getDashboardAlerts(currentMonth, currentYear),
      getTopOverdue(10),
      getRecentPayments(10),
      getDashboardPeriodStatus(currentMonth, currentYear)
    ]);

  const kpiData = kpis.success && kpis.data ? kpis.data : null;
  const chartData = charts.success && charts.data ? charts.data : null;
  const alertData = alerts.success && alerts.data ? alerts.data : [];
  const overdueData =
    topOverdue.success && topOverdue.data
      ? topOverdue.data
      : {
          items: [],
          totals: { memberCount: 0, chargeCount: 0, totalOpenAmount: 0 }
        };
  const paymentData =
    recentPayments.success && recentPayments.data ? recentPayments.data : [];
  const isClosed = periodStatus.success ? periodStatus.closed : false;

  return (
    <PageContainer
      scrollable={false}
      pageTitle={`Olá, ${firstName} 👋`}
      pageDescription={`Competência: ${MONTH_NAMES[currentMonth]} ${currentYear}`}
    >
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Period closed badge */}
        {isClosed && (
          <div className='flex items-center gap-2'>
            <Badge
              variant='secondary'
              className='gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100'
            >
              <IconLock className='h-3 w-3' />
              Período Encerrado
            </Badge>
          </div>
        )}

        {/* Alerts */}
        <DashboardAlerts alerts={alertData} />

        {/* KPI Cards */}
        {kpiData && <DashboardKPICards data={kpiData} />}

        {/* Charts Row 1: Area chart (large) + Pie chart (small) */}
        {chartData && (
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <div className='lg:col-span-4'>
              <DashboardAreaChart data={chartData.monthlyTrend} />
            </div>
            <div className='lg:col-span-3'>
              <DashboardPieChart data={chartData.paymentMethodBreakdown} />
            </div>
          </div>
        )}

        {/* Charts Row 2: Bar chart (charge type) + Overdue chart */}
        {chartData && (
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
            <div className='lg:col-span-4'>
              <DashboardBarChart data={chartData.chargeTypeRevenue} />
            </div>
            <div className='lg:col-span-3'>
              <DashboardOverdueChart data={chartData.monthlyOverdue} />
            </div>
          </div>
        )}

        {/* Bottom Row: Top Overdue + Recent Payments */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <DashboardTopOverdue data={overdueData} />
          <DashboardRecentPayments data={paymentData} />
        </div>
      </div>
    </PageContainer>
  );
}
