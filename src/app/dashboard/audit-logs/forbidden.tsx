import PageContainer from '@/components/layout/page-container';

export default function AuditLogsForbiddenPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Acesso negado'
      pageDescription='Somente tesouraria, diretoria e administracao podem acessar a auditoria.'
    >
      <div className='rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
        Seu papel atual nao possui permissao para visualizar logs de auditoria.
      </div>
    </PageContainer>
  );
}
