'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  IconShieldLock,
  IconIdBadge,
  IconArrowRight,
  IconLoader2
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import { verifyCim } from '@/features/member-portal/server/verify-cim.actions';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

export default function VerifyCimPage() {
  const router = useRouter();
  const [cim, setCim] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await verifyCim(cim);

      if (result.success) {
        // Hard navigation para garantir que o layout do dashboard
        // re-execute a verificação server-side com dados frescos
        window.location.href = '/dashboard';
        return;
      } else {
        setError(result.error || 'Erro ao verificar CIM.');
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <motion.div
        initial='hidden'
        animate='visible'
        variants={containerVariants}
        className='w-full max-w-md'
      >
        <Card className='border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl'>
          <CardHeader className='text-center pb-2'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10'>
              <IconShieldLock className='h-8 w-8 text-primary' />
            </div>
            <CardTitle className='text-2xl font-bold tracking-tight'>
              Verificação de Identidade
            </CardTitle>
            <CardDescription className='text-base mt-2'>
              Para sua segurança, informe o número do seu{' '}
              <strong>CIM</strong> (Cartão de Identificação Maçônica) para
              vincular sua conta ao portal.
            </CardDescription>
          </CardHeader>

          <CardContent className='pt-6'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-2'>
                <label
                  htmlFor='cim-input'
                  className='text-sm font-medium text-foreground/80'
                >
                  Número do CIM
                </label>
                <div className='relative flex items-center'>
                  <div className='pointer-events-none absolute left-3 flex items-center text-muted-foreground'>
                    <IconIdBadge className='h-5 w-5' />
                  </div>
                  <Input
                    id='cim-input'
                    className='h-12 pl-10 text-lg bg-background/50 transition-all focus:bg-background'
                    placeholder='Digite seu CIM'
                    value={cim}
                    onChange={(e) => setCim(e.target.value)}
                    disabled={isLoading}
                    autoFocus
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'
                >
                  {error}
                </motion.div>
              )}

              <Button
                type='submit'
                className='h-12 w-full text-base shadow-md transition-all hover:shadow-lg'
                disabled={isLoading || !cim.trim()}
              >
                {isLoading ? (
                  <>
                    <IconLoader2 className='mr-2 h-5 w-5 animate-spin' />
                    Verificando...
                  </>
                ) : (
                  <>
                    Verificar e Acessar
                    <IconArrowRight className='ml-2 h-5 w-5' />
                  </>
                )}
              </Button>

              <p className='text-center text-xs text-muted-foreground'>
                Se você não possui o CIM ou está com dificuldades, entre em
                contato com a Tesouraria da sua Loja.
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
