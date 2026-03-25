'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  memberFormSchema,
  type MemberFormValues
} from '../schemas/member.schema';
import { createMember, updateMember } from '../server/member.actions';
import { type MemberSerializable } from './member-tables/columns';

interface MemberFormProps {
  initialData?: MemberSerializable | null;
}

export function MemberForm({ initialData }: MemberFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: initialData
      ? {
          fullName: initialData.fullName,
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
    <Card className='mx-auto w-full'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>
          {isEditing ? 'Editar Membro' : 'Novo Membro'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder='Nome do irmão' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='email@exemplo.com'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder='(00) 00000-0000' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
                <FormItem>
                  <FormLabel>Data de Ingresso</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='notesInternal'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações Internas</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Notas visíveis apenas para tesoureiro e admin...'
                    className='min-h-[100px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex gap-4'>
            <Button type='submit' disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? 'Salvando...'
                : isEditing
                  ? 'Salvar Alterações'
                  : 'Cadastrar Membro'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push('/dashboard/members')}
            >
              Cancelar
            </Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
