import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export const metadata: Metadata = {
  title: 'UPJ Control — Tesouraria',
  description: 'Sistema de gestão financeira para tesouraria',
  robots: {
    index: false,
    follow: false
  }
};

/**
 * Verifica se o usuário autenticado está vinculado a um membro.
 * - Se já vinculado por clerkUserId → acesso liberado.
 * - Se email existe na tabela members mas sem clerkUserId → redireciona para verificação de CIM.
 * - Se email não existe na tabela members → redireciona para página de não autorizado.
 *
 * Roles admin/treasurer são isentos desta verificação, pois podem não estar
 * cadastrados como membros da loja.
 */
async function checkMemberAccess() {
  const { userId, orgRole } = await auth();

  // Não autenticado — deixa o Clerk middleware lidar
  if (!userId) return;

  // Roles administrativos são isentos da verificação de CIM
  const adminRoles = ['org:admin', 'org:treasurer'];
  if (orgRole && adminRoles.includes(orgRole)) return;

  // 1. Verificar se já existe vínculo pelo clerkUserId
  const linkedMember = await prisma.member.findUnique({
    where: { clerkUserId: userId },
    select: { id: true }
  });

  if (linkedMember) return; // Já vinculado

  // 2. Buscar email do Clerk
  const user = await currentUser();
  if (!user) return;

  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress;

  if (!primaryEmail) {
    redirect('/auth/unauthorized');
  }

  // 3. Verificar se existe membro com este email
  const memberByEmail = await prisma.member.findUnique({
    where: { email: primaryEmail },
    select: { id: true, clerkUserId: true }
  });

  if (memberByEmail && !memberByEmail.clerkUserId) {
    // Membro existe mas não vinculado → pedir CIM
    redirect('/auth/verify-cim');
  }

  if (!memberByEmail) {
    // Email não existe na tesouraria
    redirect('/auth/unauthorized');
  }
}

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  // Verificar acesso do membro antes de renderizar
  await checkMemberAccess();

  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <InfobarProvider defaultOpen={false}>
          <AppSidebar />
          <SidebarInset>
            <Header />
            {/* page main content */}
            {children}
            {/* page main content ends */}
          </SidebarInset>
          <InfoSidebar side='right' />
        </InfobarProvider>
      </SidebarProvider>
    </KBar>
  );
}

