import { type WorkoutPlan, type ProgressData, type Exercise } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

type RawExercise = Omit<Exercise, 'thumbnailUrl' | 'thumbnailHint'> & { imageId: string };

const rawWorkoutPlan: { name: string; days: { [key: string]: RawExercise[] } } = {
  name: "Base de Força para Iniciantes",
  days: {
    'Dia 1: Corpo Inteiro A': [
      { id: '1', name: 'Agachamento Goblet', sets: 3, reps: '8-12', rest: '60s', videoUrl: 'https://www.youtube.com/embed/MeW_P-2_3r0', imageId: 'squat' },
      { id: '2', name: 'Flexões', sets: 3, reps: 'Quantas conseguir', rest: '60s', videoUrl: 'https://www.youtube.com/embed/p7_S8sS55Cg', imageId: 'pushup' },
      { id: '3', name: 'Remada com Halter', sets: 3, reps: '8-12 por braço', rest: '60s', videoUrl: 'https://www.youtube.com/embed/pYcpY20QaE8', imageId: 'dumbbell-row' },
      { id: '4', name: 'Prancha', sets: 3, reps: '30-60 segundos', rest: '60s', videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw', imageId: 'plank' },
    ],
    'Dia 2: Corpo Inteiro B': [
      { id: '5', name: 'Levantamento Terra Romeno', sets: 3, reps: '10-15', rest: '60s', videoUrl: 'https://www.youtube.com/embed/2_g28_Mcy7w', imageId: 'romanian-deadlift' },
      { id: '6', name: 'Desenvolvimento com Halteres', sets: 3, reps: '8-12', rest: '60s', videoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI', imageId: 'overhead-press' },
      { id: '7', name: 'Puxada na Polia Alta', sets: 3, reps: '8-12', rest: '60s', videoUrl: 'https://www.youtube.com/embed/gpc3t29nJJA', imageId: 'lat-pulldown' },
      { id: '8', name: 'Prancha', sets: 3, reps: '30-60 segundos', rest: '60s', videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw', imageId: 'plank' },
    ],
  }
};

export const progressData: ProgressData[] = [
  { date: 'Semana 1', 'Total Weight': 1500 },
  { date: 'Semana 2', 'Total Weight': 1650 },
  { date: 'Semana 3', 'Total Weight': 1800 },
  { date: 'Semana 4', 'Total Weight': 2000 },
  { date: 'Semana 5', 'Total Weight': 2100 },
  { date: 'Semana 6', 'Total Weight': 2300 },
];

export const getInitialWorkoutPlan = (): WorkoutPlan => {
  const planWithImages: WorkoutPlan = { name: rawWorkoutPlan.name, days: {} };

  for (const day in rawWorkoutPlan.days) {
    planWithImages.days[day] = rawWorkoutPlan.days[day].map((exercise) => {
      const imageData = getImage(exercise.imageId);
      if (!imageData) {
        console.warn(`Image data not found for id: ${exercise.imageId}`);
      }
      return {
        ...exercise,
        thumbnailUrl: imageData?.imageUrl || '',
        thumbnailHint: imageData?.imageHint || ''
      };
    });
  }

  return planWithImages;
}
