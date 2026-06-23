import PageContainer from '@/components/layout/page-container';

export const metadata = {
  title: 'Dashboard: Visão Geral'
};

export default function OverviewLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <PageContainer>{children}</PageContainer>;
}