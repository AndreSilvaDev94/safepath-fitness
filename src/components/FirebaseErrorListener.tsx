// src/components/FirebaseErrorListener.tsx
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error('Caught Firestore Permission Error:', error.context);
      
      // We can throw the error to make it visible in Next.js dev overlay
      // during development for easier debugging.
      if (process.env.NODE_ENV === 'development') {
        // We wrap it in a custom error to provide more context.
        const devError = new Error(
          `Firestore Security Rule Violation: ${JSON.stringify(error.context, null, 2)}`
        );
        devError.stack = error.stack;
        throw devError;
      } else {
        // In production, we might just show a generic toast.
        toast({
          variant: 'destructive',
          title: 'Acesso Negado',
          description: 'Você não tem permissão para realizar esta ação.',
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null; // This component does not render anything.
}
