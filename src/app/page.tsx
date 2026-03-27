import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { resolveDashboardLanding } from '@/lib/auth/landing';

export default async function Page() {
  const { userId, orgRole } = await auth();
  const landingPath = await resolveDashboardLanding({ userId, orgRole });
  return redirect(landingPath);
}
