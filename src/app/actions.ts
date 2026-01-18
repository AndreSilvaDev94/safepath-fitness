'use server';

import {
  generatePersonalizedWorkoutPlan,
  type GeneratePersonalizedWorkoutPlanInput,
} from '@/ai/flows/generate-personalized-workout-plan';
import { z } from 'zod';

const formSchema = z.object({
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  goals: z.string().min(10, 'Please describe your goals in more detail.'),
  availableEquipment: z.string().min(5, 'Please list at least some equipment.'),
});

export async function getWorkoutPlanAction(values: unknown) {
  const validatedFields = formSchema.safeParse(
    values as GeneratePersonalizedWorkoutPlanInput
  );

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data.',
      details: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generatePersonalizedWorkoutPlan(validatedFields.data);
    return { data: result.workoutPlan };
  } catch (error) {
    console.error('Error generating workout plan:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
