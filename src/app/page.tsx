import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { userId, orgRole } = await auth();

  if (!userId) {
    return redirect('/auth/sign-in');
  }

  // Se o usuário for um membro (org:member), redireciona direto para o portal deles
  if (orgRole === 'org:member') {
    return redirect('/dashboard/portal');
  }

  // Caso contrário (admin, treasurer, manager), vai para o overview geral
  return redirect('/dashboard/overview');
}
