import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

import {
  findLinkedMember,
  getAdminDashboardPath,
  getMemberDashboardPath,
  getPrimaryEmailByUserId,
  isAdminRole
} from '@/lib/auth/member-link';
import { prisma } from '@/lib/db';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
const isVerifyCimRoute = createRouteMatcher(['/auth/verify-cim']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  if (isVerifyCimRoute(req)) {
    const { userId, orgRole } = await auth();

    if (!userId) {
      return NextResponse.redirect(new URL('/auth/sign-in', req.url));
    }

    if (isAdminRole(orgRole)) {
      return NextResponse.redirect(new URL(getAdminDashboardPath(), req.url));
    }

    const primaryEmail = await getPrimaryEmailByUserId(userId);
    const linkedMember = await findLinkedMember(userId, primaryEmail);

    if (linkedMember) {
      return NextResponse.redirect(new URL(getMemberDashboardPath(), req.url));
    }

    return;
  }

  if (isProtectedRoute(req)) {
    const { userId, orgRole } = await auth.protect();

    if (isAdminRole(orgRole)) return;

    const primaryEmail = await getPrimaryEmailByUserId(userId);
    const linkedMember = await findLinkedMember(userId, primaryEmail);

    if (linkedMember) return;

    if (!primaryEmail) {
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
    }

    const memberByEmail = await prisma.member.findUnique({
      where: { email: primaryEmail },
      select: { id: true, clerkUserId: true }
    });

    if (memberByEmail && !memberByEmail.clerkUserId) {
      return NextResponse.redirect(new URL('/auth/verify-cim', req.url));
    }

    if (!memberByEmail) {
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ]
};
