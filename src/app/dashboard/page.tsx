'use client';

import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Dumbbell, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import WorkoutSheet from '@/components/workout-sheet';
import type { GeneratedWorkoutPlan } from '@/lib/workout-types';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();

  const plansQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, 'users', user.uid, 'plans'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [db, user]);

  const { data: plans, isLoading: plansLoading } = useCollection(plansQuery);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const latestPlan = plans?.[0] as GeneratedWorkoutPlan | undefined;

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
           <div className="flex items-center gap-2 font-bold text-lg">
             <Dumbbell className="h-6 w-6 text-primary" />
             SafePath Fitness
           </div>
           <div className="flex items-center gap-3">
             <span className="text-sm font-medium">{user.displayName}</span>
             <Avatar>
               <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
               <AvatarFallback>
                 <User />
               </AvatarFallback>
             </Avatar>
           </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Seu Painel</h1>
          <p className="text-muted-foreground">Bem-vindo(a) de volta! Aqui está seu último plano.</p>

          <div className="mt-6">
            {plansLoading && <p>Carregando seus planos...</p>}
            {!plansLoading && !latestPlan && (
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Nenhum Plano Encontrado</CardTitle>
                        <CardDescription>Você ainda não salvou nenhum plano de treino.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/')}>Gerar meu primeiro plano</Button>
                    </CardContent>
                </Card>
            )}
            {latestPlan && <WorkoutSheet plan={latestPlan} />}
          </div>
        </div>
      </main>
    </div>
  );
}
