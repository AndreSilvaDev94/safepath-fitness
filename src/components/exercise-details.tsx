'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ExerciseVideoModal } from './exercise-video-modal';
import type { Exercise } from '@/lib/types';
import { CheckCircle, Clock, Repeat, Video } from 'lucide-react';

interface ExerciseDetailsProps {
  exercise: Exercise;
}

export function ExerciseDetails({ exercise }: ExerciseDetailsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setsArray = Array.from({ length: exercise.sets }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          className="relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg"
          onClick={() => setIsModalOpen(true)}
        >
          <Image
            src={exercise.thumbnailUrl}
            alt={`Thumbnail for ${exercise.name}`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            data-ai-hint={exercise.thumbnailHint}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Video className="h-10 w-10 text-white" />
          </div>
        </div>
        <div className="flex flex-col justify-center space-y-2">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">
              {exercise.sets} Séries
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Repeat className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{exercise.reps} Repetições</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{exercise.rest} Descanso</span>
          </div>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Video className="mr-2 h-4 w-4" />
            Ver Guia de Execução
          </Button>
        </div>
      </div>
      <Separator />
      <div>
        <h4 className="mb-2 font-semibold">Registre seu Treino</h4>
        <div className="space-y-2">
          {setsArray.map((setNumber) => (
            <div
              key={setNumber}
              className="flex items-center space-x-2 rounded-md bg-muted/50 p-2"
            >
              <Checkbox id={`set-${exercise.id}-${setNumber}`} />
              <Label htmlFor={`set-${exercise.id}-${setNumber}`}>
                Série {setNumber} concluída
              </Label>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Marque a caixa após completar uma série. Continue o bom trabalho!
        </p>
      </div>
      <ExerciseVideoModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title={exercise.name}
        videoUrl={exercise.videoUrl}
      />
    </div>
  );
}
