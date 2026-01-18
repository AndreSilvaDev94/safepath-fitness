import { type WorkoutPlan, type ProgressData, type Exercise } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

type RawExercise = Omit<Exercise, 'thumbnailUrl' | 'thumbnailHint'> & { imageId: string };

const rawWorkoutPlan: { name: string; days: { [key: string]: RawExercise[] } } = {
  name: "Beginner's Strength Foundation",
  days: {
    'Day 1: Full Body A': [
      { id: '1', name: 'Goblet Squat', sets: 3, reps: '8-12', rest: '60s', videoUrl: 'https://www.youtube.com/embed/MeW_P-2_3r0', imageId: 'squat' },
      { id: '2', name: 'Push-ups', sets: 3, reps: 'As many as possible', rest: '60s', videoUrl: 'https://www.youtube.com/embed/p7_S8sS55Cg', imageId: 'pushup' },
      { id: '3', name: 'Dumbbell Rows', sets: 3, reps: '8-12 per arm', rest: '60s', videoUrl: 'https://www.youtube.com/embed/pYcpY20QaE8', imageId: 'dumbbell-row' },
      { id: '4', name: 'Plank', sets: 3, reps: '30-60 seconds', rest: '60s', videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw', imageId: 'plank' },
    ],
    'Day 2: Full Body B': [
      { id: '5', name: 'Romanian Deadlift', sets: 3, reps: '10-15', rest: '60s', videoUrl: 'https://www.youtube.com/embed/2_g28_Mcy7w', imageId: 'romanian-deadlift' },
      { id: '6', name: 'Overhead Press', sets: 3, reps: '8-12', rest: '60s', videoUrl: 'https://www.youtube.com/embed/2yjwXTZQDDI', imageId: 'overhead-press' },
      { id: '7', name: 'Lat Pulldown', sets: 3, reps: '8-12', rest: '60s', videoUrl: 'https://www.youtube.com/embed/gpc3t29nJJA', imageId: 'lat-pulldown' },
      { id: '8', name: 'Plank', sets: 3, reps: '30-60 seconds', rest: '60s', videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw', imageId: 'plank' },
    ],
  }
};

export const progressData: ProgressData[] = [
  { date: 'Week 1', 'Total Weight': 1500 },
  { date: 'Week 2', 'Total Weight': 1650 },
  { date: 'Week 3', 'Total Weight': 1800 },
  { date: 'Week 4', 'Total Weight': 2000 },
  { date: 'Week 5', 'Total Weight': 2100 },
  { date: 'Week 6', 'Total Weight': 2300 },
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
