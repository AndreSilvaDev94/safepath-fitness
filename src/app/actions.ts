'use server';

import {
  generatePersonalizedWorkoutPlan,
  type GeneratePersonalizedWorkoutPlanInput,
  type GeneratedWorkoutPlan,
} from '@/ai/flows/generate-personalized-workout-plan';
import { z } from 'zod';

const formSchema = z.object({
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  goals: z.string().min(10, 'Por favor, descreva seus objetivos com mais detalhes.'),
  availableEquipment: z.string().min(5, 'Por favor, liste pelo menos algum equipamento.'),
});

export async function getWorkoutPlanAction(values: unknown): Promise<{
    data?: GeneratedWorkoutPlan;
    error?: string;
    errorDetails?: any;
    details?: any;
}> {
  const validatedFields = formSchema.safeParse(
    values as GeneratePersonalizedWorkoutPlanInput
  );

  if (!validatedFields.success) {
    return {
      error: 'Dados do formulário inválidos.',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generatePersonalizedWorkoutPlan(validatedFields.data);
    return { data: result };
  } catch (error: any) {
    console.error('Error generating workout plan:', error);
    return { 
      error: 'Houve um problema ao se comunicar com a IA para gerar seu treino. Por favor, tente novamente mais tarde.',
      errorDetails: error.message || 'Um erro desconhecido ocorreu.'
    };
  }
}
