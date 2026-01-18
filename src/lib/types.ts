export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  videoUrl: string;
  thumbnailUrl: string;
  thumbnailHint: string;
}

export interface WorkoutPlan {
  name: string;
  days: {
    [key: string]: Exercise[];
  };
}

export interface ProgressData {
  date: string;
  'Total Weight': number;
}
