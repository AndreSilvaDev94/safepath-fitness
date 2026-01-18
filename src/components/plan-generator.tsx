'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { getWorkoutPlanAction } from '@/app/actions';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Por favor, selecione seu nível de condicionamento físico.',
  }),
  goals: z
    .string()
    .min(10, 'Por favor, descreva seus objetivos em pelo menos 10 caracteres.')
    .max(200, 'Os objetivos não podem exceder 200 caracteres.'),
  availableEquipment: z
    .string()
    .min(5, 'Por favor, liste o equipamento em pelo menos 5 caracteres.')
    .max(200, 'A lista de equipamentos não pode exceder 200 caracteres.'),
});

type PlanGeneratorProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onPlanGenerated: (plan: string) => void;
};

export function PlanGenerator({
  isOpen,
  setIsOpen,
  onPlanGenerated,
}: PlanGeneratorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fitnessLevel: 'beginner',
      goals: '',
      availableEquipment: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = await getWorkoutPlanAction(values);
    setIsSubmitting(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Gerar Plano',
        description:
          typeof result.error === 'string'
            ? result.error
            : 'Por favor, verifique o formulário em busca de erros.',
      });
    } else if (result.data) {
      onPlanGenerated(result.data);
      form.reset();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerar um Novo Plano de Treino</DialogTitle>
          <DialogDescription>
            Conte-nos sobre você, e nossa IA criará um plano personalizado
            para você.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fitnessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seu Nível de Condicionamento Físico</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu nível atual" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seus Objetivos de Fitness</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ex: ganhar massa muscular, perder peso, melhorar a resistência"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="availableEquipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipamento que Você Tem Acesso</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ex: halteres, faixas de resistência, barra de pull-up"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  'Gerar Plano'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
