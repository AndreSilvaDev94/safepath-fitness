'use server';

import {
  generatePersonalizedWorkoutPlan,
  type GeneratePersonalizedWorkoutPlanInput,
  type GeneratedWorkoutPlan,
} from '@/ai/flows/generate-personalized-workout-plan';
import { z } from 'zod';

const goalOptions = [
  'Ganhar Massa Muscular (Hipertrofia)',
  'Perder Gordura / Emagrecimento',
  'Definição Muscular',
  'Condicionamento / Resistência',
] as const;

const equipmentOptions = [
  'Academia Completa (Máquinas e Pesos)',
  'Treino em Casa (Apenas Halteres/Pesos Livres)',
  'Peso do Corpo (Calistenia/Sem Equipamentos)',
  'Misto (Peso do corpo + Elásticos)',
] as const;

const formSchema = z.object({
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  goals: z.enum(goalOptions),
  availableEquipment: z.enum(equipmentOptions),
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
