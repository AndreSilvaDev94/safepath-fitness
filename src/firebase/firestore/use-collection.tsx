// src/firebase/firestore/use-collection.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import {
  onSnapshot,
  Query,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface UseCollectionState<T> {
  data: T[] | null;
  loading: boolean;
}

export function useCollection<T>(
  query: Query | null
): UseCollectionState<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const queryRef = useRef(query);

  useEffect(() => {
    if (!query) {
      setData(null);
      setLoading(false);
      return;
    }
    
    // Check if query has changed
    if (queryRef.current !== query) {
        queryRef.current = query;
        setLoading(true);
        setData(null);
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const result: T[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(result);
        setLoading(false);
      },
      async (err) => {
        console.error('useCollection error:', err);
        const permissionError = new FirestorePermissionError({
          path: 'path' in query ? query.path : 'N/A', // Simplified path
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading };
}
