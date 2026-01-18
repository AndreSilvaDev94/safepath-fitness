'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GeneratedWorkoutPlan, Exercise } from '@/lib/workout-types';

interface WorkoutSheetProps {
  plan: GeneratedWorkoutPlan;
}

export default function WorkoutSheet({ plan }: WorkoutSheetProps) {
  const defaultTab = plan.schedule?.[0]?.day || 'Dia 1';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">{plan.title}</CardTitle>
        <CardDescription>
          Seu plano personalizado está pronto! Clique em um exercício para ver os detalhes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${plan.schedule.length}, 1fr)` }}>
            {plan.schedule.map((daySchedule) => (
              <TabsTrigger key={daySchedule.day} value={daySchedule.day}>
                {daySchedule.day}
              </TabsTrigger>
            ))}
          </TabsList>
          {plan.schedule.map((daySchedule) => (
            <TabsContent key={daySchedule.day} value={daySchedule.day} className="mt-4">
              <Accordion type="single" collapsible className="w-full">
                {daySchedule.exercises.map((exercise: Exercise, index: number) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{exercise.name}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 px-1">
                        <div className="flex justify-around rounded-lg bg-muted/50 p-3 text-center text-sm">
                          <div className="flex-1">
                            <p className="font-semibold">{exercise.sets}</p>
                            <p className="text-xs text-muted-foreground">Séries</p>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{exercise.reps}</p>
                            <p className="text-xs text-muted-foreground">Reps</p>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{exercise.rest}</p>
                            <p className="text-xs text-muted-foreground">Descanso</p>
                          </div>
                        </div>
                        {exercise.gifUrl && (
                          <div className="mt-4 overflow-hidden rounded-lg border">
                            <img
                              src={exercise.gifUrl}
                              alt={`Animação do exercício ${exercise.name}`}
                              className="w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
