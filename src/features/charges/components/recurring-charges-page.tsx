'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconCurrencyReal,
  IconUsers,
  IconRepeat,
  IconArrowRight,
  IconInfoCircle
} from '@tabler/icons-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

import { getRecurringChargeTypes, processBulkCharges, getProcessingPreview } from '../server/recurring-charges.actions';

export function RecurringChargesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [chargeTypes, setChargeTypes] = useState<any[]>([]);
  
  // Form state
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [preview, setPreview] = useState<{ memberCount: number } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const types = await getRecurringChargeTypes();
      setChargeTypes(types);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTypeId) {
      const loadPreview = async () => {
        const pre = await getProcessingPreview(selectedTypeId);
        setPreview(pre);
      };
      loadPreview();
    }
  }, [selectedTypeId]);

  const handleProcess = async () => {
    if (!selectedTypeId || !dueDate) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const result = await processBulkCharges({
        chargeTypeId: selectedTypeId,
        competenceMonth: month,
        competenceYear: year,
        dueDate: dueDate
      });

      if (result.success) {
        toast.success(`Sucesso: ${result.data?.createdCount} cobranças geradas. ${result.data?.skippedCount} já existiam.`);
        router.push('/dashboard/charges');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Erro ao processar cobranças');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = chargeTypes.find(t => t.id === selectedTypeId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Lançamento em Massa</h2>
        <p className="text-muted-foreground">
          Gere cobranças recorrentes para todos os membros ativos da loja simultaneamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border/50 bg-card/40 backdrop-blur-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconRepeat className="h-5 w-5 text-primary" />
              Configuração do Lançamento
            </CardTitle>
            <CardDescription>Defina as informações básicas para o processamento do lote.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="chargeType">Tipo de Cobrança Recorrente</Label>
                <Select onValueChange={setSelectedTypeId} value={selectedTypeId}>
                  <SelectTrigger id="chargeType" className="h-11">
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {chargeTypes.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedType && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <IconInfoCircle className="h-3 w-3" />
                    Valor configurado na regra: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedType.rule?.amount || 0)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Data de Vencimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <IconCalendar className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="month">Mês de Competência</Label>
                <Select value={month.toString()} onValueChange={v => setMonth(parseInt(v))}>
                  <SelectTrigger id="month" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Ano de Competência</Label>
                <Input
                  id="year"
                  type="number"
                  className="h-11"
                  value={year}
                  onChange={e => setYear(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                onClick={handleProcess} 
                disabled={loading || !selectedTypeId}
                className="h-11 px-8 gap-2 shadow-md hover:shadow-lg transition-all"
              >
                {loading ? 'Processando...' : (
                  <>
                    <IconArrowRight className="h-5 w-5" />
                    Lançar Cobranças do Mês
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/50 bg-card/40 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <IconUsers className="h-5 w-5 text-blue-500" />
                Preview do Público
              </CardTitle>
            </CardHeader>
            <CardContent>
              {preview ? (
                <div className="space-y-4">
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                    <div className="text-sm text-muted-foreground">Membros Ativos afetados</div>
                    <div className="text-3xl font-bold text-primary">{preview.memberCount}</div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O sistema buscará todos os membros com status <strong>Ativo</strong>. Membros licenciados, remidos ou inativos serão ignorados automaticamente.
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic h-24 flex items-center justify-center">
                  Selecione um tipo de cobrança para ver o preview.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/40 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <IconClock className="h-5 w-5 text-amber-500" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <IconCheck className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                <p className="text-xs text-muted-foreground">Prevenção contra lançamentos duplicados no mesmo mês.</p>
              </div>
              <div className="flex items-start gap-3">
                <IconCheck className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                <p className="text-xs text-muted-foreground">Respeita o fechamento de caixa do período.</p>
              </div>
              <div className="flex items-start gap-3">
                <IconCheck className="h-4 w-4 text-emerald-500 mt-1 shrink-0" />
                <p className="text-xs text-muted-foreground">Registra cada operação no log de auditoria.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
