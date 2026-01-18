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
  goals: z.string().describe('Os objetivos de fitness do usuário.'),
  availableEquipment: z
    .string()
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
  videoSearchTerm: z
    .string()
    .describe(
      'Um termo de busca conciso para encontrar um vídeo de execução no YouTube.'
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

  Crie um plano de treino claro, conciso e motivador. Para 'videoSearchTerm', use o nome do exercício em inglês para melhores resultados de busca.`,
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
