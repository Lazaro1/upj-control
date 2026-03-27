'use server';

import { prisma } from '@/lib/db';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function verifyCim(cim: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: 'Usuário não autenticado.' };
  }

  // Buscar o email do Clerk
  const user = await currentUser();
  if (!user) {
    return { success: false, error: 'Não foi possível obter dados do usuário.' };
  }

  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress;

  if (!primaryEmail) {
    return { success: false, error: 'E-mail não encontrado na conta.' };
  }

  // Buscar membro pelo email
  const member = await prisma.member.findUnique({
    where: { email: primaryEmail }
  });

  if (!member) {
    return {
      success: false,
      error: 'Nenhum membro encontrado com este e-mail. Entre em contato com a Tesouraria.'
    };
  }

  // Verificar se o membro tem CIM cadastrado
  if (!member.cim) {
    return {
      success: false,
      error: 'Seu CIM ainda não foi cadastrado pela Tesouraria. Entre em contato para regularizar.'
    };
  }

  // Comparar CIM (case-insensitive, sem espaços)
  const cimNormalized = cim.trim().toUpperCase();
  const memberCimNormalized = member.cim.trim().toUpperCase();

  if (cimNormalized !== memberCimNormalized) {
    return {
      success: false,
      error: 'CIM informado não confere. Verifique e tente novamente.'
    };
  }

  // CIM válido — vincular o clerkUserId ao membro
  await prisma.member.update({
    where: { id: member.id },
    data: { clerkUserId: userId }
  });

  return { success: true };
}
