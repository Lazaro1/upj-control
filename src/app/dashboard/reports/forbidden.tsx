import PageContainer from '@/components/layout/page-container';

export default function ReportsForbiddenPage() {
  return (
    <PageContainer
      scrollable={false}
      pageTitle='Acesso negado'
      pageDescription='Somente tesouraria, diretoria e administracao podem acessar relatorios financeiros.'
    >
      <div className='rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
        Seu papel atual nao possui permissao para visualizar ou exportar este
        relatorio.
      </div>
    </PageContainer>
  );
}
