import { SignOutButton } from '@clerk/nextjs';
import {
  IconShieldX,
  IconLogout
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export const metadata = {
  title: 'Acesso Não Autorizado — UPJ Control'
};

export default function UnauthorizedPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md'>
        <Card className='border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl'>
          <CardHeader className='text-center pb-2'>
            <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10'>
              <IconShieldX className='h-8 w-8 text-destructive' />
            </div>
            <CardTitle className='text-2xl font-bold tracking-tight'>
              Acesso Não Autorizado
            </CardTitle>
            <CardDescription className='text-base mt-2'>
              Para acessar o portal, seu e-mail deve ser previamente
              cadastrado pela <strong>Tesouraria da Loja</strong>.
            </CardDescription>
          </CardHeader>

          <CardContent className='pt-6 space-y-6'>
            <div className='rounded-lg border border-border/50 bg-muted/50 px-4 py-3 text-sm text-muted-foreground'>
              <p>
                <strong>O que fazer?</strong>
              </p>
              <ul className='mt-2 list-disc pl-4 space-y-1'>
                <li>
                  Verifique se o e-mail da sua conta é o mesmo informado à Tesouraria.
                </li>
                <li>
                  Entre em contato com o Tesoureiro para que seu cadastro seja criado.
                </li>
                <li>
                  Após o cadastro, tente acessar novamente.
                </li>
              </ul>
            </div>

            <SignOutButton>
              <Button
                variant='outline'
                className='h-11 w-full'
              >
                <IconLogout className='mr-2 h-4 w-4' />
                Sair e tentar com outra conta
              </Button>
            </SignOutButton>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
