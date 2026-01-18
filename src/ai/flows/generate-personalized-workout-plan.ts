'use server';

/**
 * @fileOverview Generates a personalized workout plan based on user fitness level, goals, and available equipment.
 *
 * - generatePersonalizedWorkoutPlan - A function that generates a personalized workout plan.
 * - GeneratePersonalizedWorkoutPlanInput - The input type for the generatePersonalizedWorkoutPlan function.
 * - GeneratePersonalizedWorkoutPlanOutput - The return type for the generatePersonalizedWorkoutPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedWorkoutPlanInputSchema = z.object({
  fitnessLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The fitness level of the user.'),
  goals: z.string().describe('The fitness goals of the user.'),
  availableEquipment: z
    .string()
    .describe('The equipment available to the user.'),
});
export type GeneratePersonalizedWorkoutPlanInput = z.infer<
  typeof GeneratePersonalizedWorkoutPlanInputSchema
>;

const GeneratePersonalizedWorkoutPlanOutputSchema = z.object({
  workoutPlan: z.string().describe('The personalized workout plan.'),
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
  prompt: `You are a personal trainer who specializes in creating workout plans for beginners.

  Based on the user's fitness level, goals, and available equipment, create a personalized workout plan.

  Fitness Level: {{{fitnessLevel}}}
  Goals: {{{goals}}}
  Available Equipment: {{{availableEquipment}}}

  Workout Plan:`, // Ensure this is valid Handlebars.
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
