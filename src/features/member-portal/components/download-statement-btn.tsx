'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconDownload, IconLoader2 } from '@tabler/icons-react';
import { toast } from 'sonner';

interface DownloadStatementBtnProps {
  memberId: string;
  type?: 'extrato' | 'ficha';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function DownloadStatementBtn({ 
  memberId, 
  type = 'extrato',
  variant = 'default',
  size = 'default'
}: DownloadStatementBtnProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDownload() {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/members/${memberId}/extrato?type=${type}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar o documento');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extrato-${memberId.substring(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Documento baixado com sucesso');
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro ao baixar o documento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleDownload}
      disabled={isLoading}
    >
      {isLoading ? (
        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <IconDownload className="mr-2 h-4 w-4" />
      )}
      Baixar Extrato
    </Button>
  );
}
