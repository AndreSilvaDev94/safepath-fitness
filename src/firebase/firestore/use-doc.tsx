// src/firebase/firestore/use-doc.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import {
  onSnapshot,
  DocumentReference,
  DocumentData,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


interface UseDocState<T> {
  data: T | null;
  loading: boolean;
}

export function useDoc<T>(
  docRef: DocumentReference | null
): UseDocState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const docRefRef = useRef(docRef);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    if (docRefRef.current !== docRef) {
        docRefRef.current = docRef;
        setLoading(true);
        setData(null);
    }

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          const result = {
            id: snapshot.id,
            ...snapshot.data(),
          } as T;
          setData(result);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      async (err) => {
        console.error('useDoc error:', err);
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading };
}
