import PageContainer from '@/components/layout/page-container';
import { auth } from '@clerk/nextjs/server';
import { forbidden, redirect } from 'next/navigation';
import { AuditLogListing } from '@/features/audit-logs/components/audit-log-listing';
import { AuditLogInfoDialog } from '@/features/audit-logs/components/audit-log-info-dialog';
import { getAuditLogs } from '@/features/audit-logs/server/audit-log.actions';

export const metadata = {
  title: 'Dashboard: Auditoria'
};

export default async function AuditLogsPage() {
  const { orgId, orgRole } = await auth();

  if (!orgId) {
    redirect('/dashboard/workspaces');
  }

  if (orgRole === 'org:member') {
    forbidden();
  }

  const initial = await getAuditLogs({ page: 1, pageSize: 20 });

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Auditoria'
      pageDescription='Rastreabilidade completa das operacoes criticas financeiras.'
      pageHeaderAction={<AuditLogInfoDialog />}
    >
      <AuditLogListing
        initialItems={
          initial.success && initial.data
            ? initial.data.items.map((item) => ({
                ...item,
                createdAt: item.createdAt.toISOString()
              }))
            : []
        }
        initialPagination={
          initial.success && initial.data
            ? initial.data.pagination
            : { page: 1, pageSize: 20, totalItems: 0, totalPages: 0 }
        }
      />
    </PageContainer>
  );
}
