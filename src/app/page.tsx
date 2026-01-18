'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, Sparkles, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlanGenerator } from '@/components/plan-generator';
import WorkoutSheet from '@/components/workout-sheet';
import type { GeneratedWorkoutPlan } from '@/ai/flows/generate-personalized-workout-plan';
import { useUser, useAuth, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, type AuthError } from 'firebase/auth';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


export default function Home() {
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedWorkoutPlan | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handlePlanGenerated = (plan: GeneratedWorkoutPlan) => {
    setGeneratedPlan(plan);
    setIsGeneratorOpen(false);
  };

  const handleSaveAndStart = async () => {
    if (!generatedPlan || !firestore) return;
    setIsSaving(true);
    
    try {
      let currentUser = user;
      if (!currentUser && auth) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
      }

      if (currentUser) {
        // Use a função não-bloqueante para salvar
        addDocumentNonBlocking(collection(firestore, 'users', currentUser.uid, 'workoutPlans'), {
          ...generatedPlan,
          createdAt: serverTimestamp(),
          userProfileId: currentUser.uid,
        });
        
        toast({
          title: "Plano Salvo!",
          description: "Seu novo plano de treino foi salvo com sucesso.",
        });

        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error("Error during save/login process: ", error);
      const authError = error as AuthError;
      let description = 'Não foi possível fazer login ou salvar seu plano. Verifique se os pop-ups estão ativados e tente novamente.';
      if(authError.code === 'auth/operation-not-allowed'){
        description = "Login com Google não está ativado no Firebase. Por favor, ative-o no console."
      } else if (authError.code) {
        description = `Ocorreu um erro de autenticação: ${authError.code}`;
      }

      toast({
        variant: 'destructive',
        title: 'Erro no Login ou ao Salvar',
        description: description,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
        {generatedPlan ? (
          <div className="relative mx-auto w-full max-w-3xl animate-in fade-in-50 duration-500">
            <WorkoutSheet plan={generatedPlan} />
             <Button
                size="lg"
                className="sticky bottom-5 mx-auto mt-6 flex animate-in fade-in zoom-in-95"
                onClick={handleSaveAndStart}
                disabled={isSaving || isUserLoading}
              >
                <Save className="mr-2 h-5 w-5" />
                {isSaving ? 'Salvando...' : 'Salvar e Começar'}
              </Button>
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
