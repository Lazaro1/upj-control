'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DownloadStatementBtn } from './download-statement-btn';

interface PortalPageActionsProps {
  memberId: string;
}

export function PortalPageActions({ memberId }: PortalPageActionsProps) {
  return (
    <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row'>
      <DownloadStatementBtn memberId={memberId} type='extrato' />
      <Button variant='outline' asChild>
        <Link href='/dashboard/portal/transactions'>Ver Histórico</Link>
      </Button>
    </div>
  );
}
