'use client';

import { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getInitialWorkoutPlan, progressData } from '@/lib/placeholder-data';
import type { WorkoutPlan } from '@/lib/types';
import WorkoutPlanDisplay from '@/components/workout-plan';
import ProgressOverview from '@/components/progress-overview';
import { PlanGenerator } from '@/components/plan-generator';

export default function Home() {
  const [workoutPlan] = useState<WorkoutPlan>(getInitialWorkoutPlan());
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const handlePlanGenerated = (plan: string) => {
    setGeneratedPlan(plan);
    setIsGeneratorOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <nav className="flex w-full items-center gap-6 text-lg font-medium md:text-sm">
          <a
            href="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl">SafePath Fitness</span>
          </a>
          <div className="ml-auto">
            <Button onClick={() => setIsGeneratorOpen(true)}>
              Generate New Plan with AI
            </Button>
          </div>
        </nav>
        <PlanGenerator
          isOpen={isGeneratorOpen}
          setIsOpen={setIsGeneratorOpen}
          onPlanGenerated={handlePlanGenerated}
        />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Your Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your safe path for today. You're on the right track.
          </p>
        </div>

        {generatedPlan && (
          <div className="mx-auto w-full max-w-6xl">
            <Card className="bg-accent/50 border-accent">
              <CardHeader>
                <CardTitle>Your New AI-Generated Workout Plan</CardTitle>
                <CardDescription>
                  Here is the personalized workout plan created just for you.
                  You can copy it and start following your new routine.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap rounded-md bg-background/50 p-4 font-body text-sm">
                  {generatedPlan}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mx-auto grid w-full max-w-6xl gap-4 md:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WorkoutPlanDisplay plan={workoutPlan} />
          </div>
          <div className="lg:col-span-1">
            <ProgressOverview data={progressData} />
          </div>
        </div>
      </main>
    </div>
  );
}
