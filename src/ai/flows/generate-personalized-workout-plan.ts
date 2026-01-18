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

const GeneratePersonalizedWorkoutPlanOutputSchema = z.object({
  workoutPlan: z.string().describe('O plano de treino personalizado.'),
});
export type GeneratePersonalizedWorkoutPlanOutput = z.infer<
  typeof GeneratePersonalizedWorkoutPlanOutputSchema
>;

export async function generatePersonalizedWorkoutPlan(
  input: GeneratePersonalizedWorkoutPlanInput
): Promise<GeneratePersonalizedWorkoutPlanOutput> {
  return generatePersonalizedWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedWorkoutPlanPrompt',
  input: {schema: GeneratePersonalizedWorkoutPlanInputSchema},
  output: {schema: GeneratePersonalizedWorkoutPlanOutputSchema},
  prompt: `Você é um personal trainer especializado em criar planos de treino para iniciantes.

  Com base no nível de condicionamento físico, objetivos e equipamentos disponíveis do usuário, crie um plano de treino personalizado.

  Nível de Condicionamento Físico: {{{fitnessLevel}}}
  Objetivos: {{{goals}}}
  Equipamento Disponível: {{{availableEquipment}}}

  Plano de Treino:`, // Ensure this is valid Handlebars.
});

const generatePersonalizedWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedWorkoutPlanFlow',
    inputSchema: GeneratePersonalizedWorkoutPlanInputSchema,
    outputSchema: GeneratePersonalizedWorkoutPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
