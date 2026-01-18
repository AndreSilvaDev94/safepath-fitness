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
import type { WorkoutPlan, Exercise } from '@/lib/types';
import { ExerciseDetails } from './exercise-details';

interface WorkoutPlanProps {
  plan: WorkoutPlan;
}

export default function WorkoutPlanDisplay({ plan }: WorkoutPlanProps) {
  const days = Object.keys(plan.days);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{plan.name}</CardTitle>
        <CardDescription>
          Este é o seu plano atual. Clique em um exercício para ver os detalhes e registrar suas séries.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={days[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {days.map((day) => (
              <TabsTrigger key={day} value={day}>
                {day}
              </TabsTrigger>
            ))}
          </TabsList>
          {days.map((day) => (
            <TabsContent key={day} value={day}>
              <Accordion type="single" collapsible className="w-full">
                {plan.days[day].map((exercise: Exercise) => (
                  <AccordionItem key={exercise.id} value={`item-${exercise.id}`}>
                    <AccordionTrigger>{exercise.name}</AccordionTrigger>
                    <AccordionContent>
                      <ExerciseDetails exercise={exercise} />
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
