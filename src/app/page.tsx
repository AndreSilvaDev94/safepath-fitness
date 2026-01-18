'use client';

import { useState } from 'react';
import { Dumbbell, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanGenerator } from '@/components/plan-generator';

export default function Home() {
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const handlePlanGenerated = (plan: string) => {
    setGeneratedPlan(plan);
    setIsGeneratorOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
        {generatedPlan ? (
            <div className="mx-auto w-full max-w-3xl animate-in fade-in-50 duration-500">
                <Card>
                <CardHeader>
                    <CardTitle>Seu Novo Plano de Treino!</CardTitle>
                    <CardDescription>
                    Aqui está o plano de treino personalizado que nossa IA criou para você.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-left font-body text-sm">
                    {generatedPlan}
                    </pre>
                    <Button
                    size="lg"
                    className="mt-6 w-full"
                    onClick={() => setIsGeneratorOpen(true)}
                    >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Gerar Outro Plano
                    </Button>
                </CardContent>
                </Card>
            </div>
        ) : (
            <div className="flex flex-col items-center gap-4 animate-in fade-in-50 duration-500">
                <Dumbbell className="h-16 w-16 text-primary" />
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                SafePath Fitness
                </h1>
                <p className="max-w-[42rem] text-lg text-muted-foreground">
                Seu guia seguro para treinar sozinho.
                </p>
                <Button
                size="lg"
                className="mt-6"
                onClick={() => setIsGeneratorOpen(true)}
                >
                <Sparkles className="mr-2 h-5 w-5" />
                Gerar Treino com IA
                </Button>
            </div>
        )}
      </main>

      <PlanGenerator
        isOpen={isGeneratorOpen}
        setIsOpen={setIsGeneratorOpen}
        onPlanGenerated={handlePlanGenerated}
      />
    </div>
  );
}
