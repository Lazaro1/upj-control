import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const isVerifyCimRoute = createRouteMatcher(['/auth/verify-cim']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isProtectedRoute(req)) {
    const { userId, orgRole } = await auth.protect();

    // Roles administrativos são isentos da verificação de CIM
    const adminRoles = ['org:admin', 'org:treasurer', 'org:manager'];
    if (orgRole && adminRoles.includes(orgRole)) return;

    // Verificar se já existe vínculo pelo clerkUserId
    const linkedMember = await prisma.member.findUnique({
      where: { clerkUserId: userId },
      select: { id: true }
    });

    if (linkedMember) return; // Já vinculado, acesso liberado

    // Não vinculado — buscar email do Clerk para verificar se membro existe
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primaryEmail = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;

    if (!primaryEmail) {
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
    }

    const memberByEmail = await prisma.member.findUnique({
      where: { email: primaryEmail },
      select: { id: true, clerkUserId: true }
    });

    if (memberByEmail && !memberByEmail.clerkUserId) {
      // Membro existe mas não vinculado → pedir CIM
      return NextResponse.redirect(new URL('/auth/verify-cim', req.url));
    }

    if (!memberByEmail) {
      // Email não existe na tesouraria
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
