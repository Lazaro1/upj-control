import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export default async function Dashboard() {
  const { userId, orgRole } = await auth();

  if (!userId) {
    return redirect('/auth/sign-in');
  }

  // Se o role do Clerk indica membro, vai direto para o portal
  if (orgRole === 'org:member') {
    return redirect('/dashboard/portal');
  }

  // Se é admin/treasurer/manager, vai para o overview
  if (orgRole && orgRole !== 'org:member') {
    return redirect('/dashboard/overview');
  }

  // Se orgRole é indefinido (usuário sem organização ativa),
  // verificar se é um membro vinculado no banco
  const member = await prisma.member.findUnique({
    where: { clerkUserId: userId },
    select: { id: true }
  });

  if (member) {
    return redirect('/dashboard/portal');
  }

  // Fallback: redirecionar para o dashboard geral
  return redirect('/dashboard/overview');
}

