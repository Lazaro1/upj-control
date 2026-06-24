import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { clerkClient, type WebhookEvent } from '@clerk/nextjs/server';

function isAlreadyMemberError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { errors?: Array<{ code?: string }> };
  return (
    maybeError.errors?.some(
      (item) => item.code === 'organization_membership_exists'
    ) ?? false
  );
}

export async function POST(req: Request): Promise<Response> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  const organizationId = process.env.CLERK_ORG_ID;

  if (!webhookSecret || !organizationId) {
    return new NextResponse('Webhook Clerk nao configurado', { status: 500 });
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new NextResponse('Headers Svix ausentes', { status: 400 });
  }

  const payload = await req.text();
  const verifier = new Webhook(webhookSecret);

  let event: WebhookEvent;

  try {
    event = verifier.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature
    }) as WebhookEvent;
  } catch {
    return new NextResponse('Assinatura Svix invalida', { status: 400 });
  }

  if (event.type !== 'user.created') {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const userId = event.data.id;
  if (!userId) {
    return new NextResponse('Evento sem userId', { status: 400 });
  }

  try {
    const client = await clerkClient();
    await client.organizations.createOrganizationMembership({
      organizationId,
      userId,
      role: 'org:member'
    });

    return NextResponse.json({ received: true, addedToOrganization: true });
  } catch (error) {
    if (isAlreadyMemberError(error)) {
      return NextResponse.json({
        received: true,
        addedToOrganization: false,
        alreadyMember: true
      });
    }

    return new NextResponse('Falha ao adicionar membro na organizacao', {
      status: 500
    });
  }
}
