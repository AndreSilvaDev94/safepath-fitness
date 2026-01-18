export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  videoSearchTerm: string;
}

export interface DaySchedule {
  day: string;
  exercises: Exercise[];
}

export interface GeneratedWorkoutPlan {
  title: string;
  schedule: DaySchedule[];
}
