'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import {
  IconUserCircle,
  IconIdBadge,
  IconNotebook,
  IconDeviceFloppy,
  IconArrowLeft,
  IconMail,
  IconPhone,
  IconCalendarEvent
} from '@tabler/icons-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import {
  memberFormSchema,
  type MemberFormValues
} from '../schemas/member.schema';
import { createMember, updateMember } from '../server/member.actions';
import { type MemberSerializable } from './member-tables/columns';

interface MemberFormProps {
  initialData?: MemberSerializable | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export function MemberForm({ initialData }: MemberFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: initialData
      ? {
          fullName: initialData.fullName,
          cim: initialData.cim || '',
          email: initialData.email,
          phone: initialData.phone || '',
          status: initialData.status,
          joinedAt: initialData.joinedAt
            ? new Date(initialData.joinedAt).toISOString().split('T')[0]
            : '',
          notesInternal: initialData.notesInternal || ''
        }
      : {
          fullName: '',
          cim: '',
          email: '',
          phone: '',
          status: 'ativo' as const,
          joinedAt: '',
          notesInternal: ''
        }
  });

  const onSubmit = async (data: MemberFormValues) => {
    const result = isEditing
      ? await updateMember(initialData!.id, data)
      : await createMember(data);

    if (result.success) {
      toast.success(
        isEditing
          ? 'Membro atualizado com sucesso'
          : 'Membro cadastrado com sucesso'
      );
      router.push('/dashboard/members');
      router.refresh();
    } else {
      toast.error('Erro ao salvar membro. Verifique os campos.');
    }
  };

  return (
    <div className='mx-auto w-full'>
      <motion.div
        initial='hidden'
        animate='visible'
        variants={containerVariants}
        className='space-y-6'
      >
        {/* Header Actions */}
        <motion.div variants={itemVariants} className='flex items-center justify-between'>
          <Button 
            variant='ghost' 
            type='button'
            onClick={() => router.push('/dashboard/members')}
            className='gap-2 text-muted-foreground hover:text-foreground'
          >
            <IconArrowLeft className='h-4 w-4' />
            Voltar para lista
          </Button>
        </motion.div>

        <Card className='border-border/50 bg-card/40 backdrop-blur-xl shadow-lg'>
          <CardHeader className='pb-6'>
            <motion.div variants={itemVariants}>
              <CardTitle className='text-3xl font-bold tracking-tight'>
                {isEditing ? 'Editar Membro' : 'Novo Membro'}
              </CardTitle>
              <CardDescription className='text-base mt-2'>
                {isEditing 
                  ? 'Atualize os dados e o status cadastral deste membro.' 
                  : 'Cadastre um novo irmão no sistema preenchendo as informações abaixo.'}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              
              {/* Secção 1: Dados Pessoais & Contato */}
              <motion.div variants={itemVariants} className='space-y-6'>
                <div className='flex items-center gap-2 border-b pb-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                    <IconUserCircle className='h-5 w-5' />
                  </div>
                  <h3 className='text-lg font-semibold tracking-tight'>Informações Pessoais</h3>
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
                  <FormField
                    control={form.control}
                    name='fullName'
                    render={({ field }) => (
                      <FormItem className='col-span-1 md:col-span-7 group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Nome Completo</FormLabel>
                        <FormControl>
                          <Input 
                            className='h-11 bg-background/50 transition-all focus:bg-background'
                            placeholder='Nome e sobrenome do irmão' 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='cim'
                    render={({ field }) => (
                      <FormItem className='col-span-1 md:col-span-5 group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>CIM</FormLabel>
                        <FormControl>
                          <div className='relative flex items-center'>
                            <div className='pointer-events-none absolute left-3 flex items-center text-muted-foreground'>
                              <IconIdBadge className='h-4 w-4' />
                            </div>
                            <Input
                              className='h-11 pl-9 bg-background/50 transition-all focus:bg-background'
                              placeholder='Cartão de Identificação Maçônica'
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem className='col-span-1 md:col-span-5 group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>E-mail</FormLabel>
                        <FormControl>
                          <div className='relative flex items-center'>
                            <div className='pointer-events-none absolute left-3 flex items-center text-muted-foreground'>
                              <IconMail className='h-4 w-4' />
                            </div>
                            <Input
                              type='email'
                              className='h-11 pl-9 bg-background/50 transition-all focus:bg-background'
                              placeholder='email@loja.com.br'
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem className='col-span-1 md:col-span-4 group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Telefone</FormLabel>
                        <FormControl>
                          <div className='relative flex items-center'>
                            <div className='pointer-events-none absolute left-3 flex items-center text-muted-foreground'>
                              <IconPhone className='h-4 w-4' />
                            </div>
                            <Input
                              className='h-11 pl-9 bg-background/50 transition-all focus:bg-background'
                              placeholder='(00) 00000-0000'
                              {...field}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 11) val = val.slice(0, 11);
                                if (val.length > 2) {
                                  val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
                                }
                                if (val.length > 9) {
                                  val = `${val.slice(0, 10)}-${val.slice(10)}`;
                                }
                                field.onChange(val);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem className='col-span-1 md:col-span-4 group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Status na Loja</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='h-11 bg-background/50 transition-all focus:bg-background'>
                              <SelectValue placeholder='Selecione o status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='ativo'>Ativo</SelectItem>
                            <SelectItem value='inativo'>Inativo</SelectItem>
                            <SelectItem value='licenciado'>Licenciado</SelectItem>
                            <SelectItem value='remido'>Remido</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='joinedAt'
                    render={({ field }) => (
                      <FormItem className='col-span-1 md:col-span-4 group'>
                        <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Data de Ingresso</FormLabel>
                        <FormControl>
                          <div className='relative flex items-center'>
                            <div className='pointer-events-none absolute left-3 flex items-center text-muted-foreground'>
                              <IconCalendarEvent className='h-4 w-4' />
                            </div>
                            <Input 
                              type='date' 
                              className='h-11 pl-9 bg-background/50 transition-all focus:bg-background w-full'
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </motion.div>

              {/* Secção 2: Administrativo */}
              <motion.div variants={itemVariants} className='space-y-6 pt-4'>
                <div className='flex items-center gap-2 border-b pb-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                    <IconNotebook className='h-5 w-5' />
                  </div>
                  <h3 className='text-lg font-semibold tracking-tight'>Anotações Administrativas</h3>
                </div>

                <FormField
                  control={form.control}
                  name='notesInternal'
                  render={({ field }) => (
                    <FormItem className='group'>
                      <FormLabel className='text-foreground/80 group-focus-within:text-primary transition-colors'>Observações Internas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Notas visíveis apenas para a tesouraria (ex: isenção de taxas, acordos)...'
                          className='min-h-[120px] resize-none bg-background/50 transition-all focus:bg-background'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <Separator className='my-8' />

              {/* Actions */}
              <motion.div variants={itemVariants} className='flex flex-col sm:flex-row gap-4 justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => router.push('/dashboard/members')}
                  className='h-11 px-8'
                >
                  Cancelar
                </Button>
                <Button 
                  type='submit' 
                  disabled={form.formState.isSubmitting}
                  className='h-11 px-8 shadow-md transition-all hover:shadow-lg'
                >
                  <IconDeviceFloppy className='mr-2 h-5 w-5' />
                  {form.formState.isSubmitting
                    ? 'Salvando...'
                    : isEditing
                      ? 'Salvar Alterações'
                      : 'Cadastrar Membro'}
                </Button>
              </motion.div>

            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
