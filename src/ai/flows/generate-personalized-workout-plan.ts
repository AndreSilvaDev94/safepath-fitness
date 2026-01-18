'use server';

/**
 * @fileOverview Gera um plano de treino personalizado com base no nível de condicionamento físico, objetivos e equipamentos disponíveis do usuário.
 *
 * - generatePersonalizedWorkoutPlan - Uma função que gera um plano de treino personalizado.
 * - GeneratePersonalizedWorkoutPlanInput - O tipo de entrada para a função generatePersonalizedWorkoutPlan.
 * - GeneratePersonalizedWorkoutPlanOutput - O tipo de retorno para a função generatePersonalizedWorkoutPlan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedWorkoutPlanInputSchema = z.object({
  fitnessLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('O nível de condicionamento físico do usuário.'),
  goals: z
    .enum([
      'Ganhar Massa Muscular (Hipertrofia)',
      'Perder Gordura / Emagrecimento',
      'Definição Muscular',
      'Condicionamento / Resistência',
    ])
    .describe('Os objetivos de fitness do usuário.'),
  availableEquipment: z
    .enum([
      'Academia Completa (Máquinas e Pesos)',
      'Treino em Casa (Apenas Halteres/Pesos Livres)',
      'Peso do Corpo (Calistenia/Sem Equipamentos)',
      'Misto (Peso do corpo + Elásticos)',
    ])
    .describe('O equipamento disponível para o usuário.'),
});
export type GeneratePersonalizedWorkoutPlanInput = z.infer<
  typeof GeneratePersonalizedWorkoutPlanInputSchema
>;

const ExerciseSchema = z.object({
  name: z.string().describe('O nome do exercício.'),
  sets: z.string().describe('O número de séries. Ex: "3"'),
  reps: z.string().describe('A faixa de repetições. Ex: "10-12"'),
  rest: z.string().describe('O tempo de descanso entre as séries. Ex: "60s"'),
  gifUrl: z
    .string()
    .url()
    .describe(
      'A URL para um GIF animado que demonstra a execução correta do exercício. A URL deve apontar diretamente para o arquivo .gif.'
    ),
});

const DayScheduleSchema = z.object({
  day: z.string().describe('O nome do dia de treino. Ex: "Treino A"'),
  exercises: z
    .array(ExerciseSchema)
    .describe('Uma lista de exercícios para este dia.'),
});

const WorkoutPlanJsonSchema = z.object({
  title: z
    .string()
    .describe('Um nome criativo e motivador para o plano de treino.'),
  schedule: z
    .array(DayScheduleSchema)
    .describe('Um array de programações de dias de treino.'),
});

export type GeneratedWorkoutPlan = z.infer<typeof WorkoutPlanJsonSchema>;

export async function generatePersonalizedWorkoutPlan(
  input: GeneratePersonalizedWorkoutPlanInput
): Promise<GeneratedWorkoutPlan> {
  return generatePersonalizedWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedWorkoutPlanPrompt',
  input: {schema: GeneratePersonalizedWorkoutPlanInputSchema},
  output: {schema: WorkoutPlanJsonSchema},
  prompt: `Você é um personal trainer de elite especializado em criar planos de treino eficazes e seguros para iniciantes que treinam sozinhos.
  Sua tarefa é gerar um plano de treino em formato JSON estruturado. O plano deve ser dividido em dias (ex: Treino A, Treino B).

  Responda estritamente no formato JSON definido no esquema de saída.

  Com base nas seguintes informações do usuário:
  - Nível de Condicionamento Físico: {{{fitnessLevel}}}
  - Objetivos: {{{goals}}}
  - Equipamento Disponível: {{{availableEquipment}}}

  Crie um plano de treino claro, conciso e motivador. Para 'gifUrl', forneça um link direto para um GIF animado (.gif) que demonstre a execução do exercício.`,
});

const generatePersonalizedWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedWorkoutPlanFlow',
    inputSchema: GeneratePersonalizedWorkoutPlanInputSchema,
    outputSchema: WorkoutPlanJsonSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
