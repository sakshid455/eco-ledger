'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    };
  };
}

export function useCollection<T = any>(
  memoizedTargetRefOrQuery:
    | ((CollectionReference<DocumentData> | Query<DocumentData>) & {
        __memo?: boolean;
      })
    | null
    | undefined
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;

  const [data, setData] = useState<ResultItemType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  
  useEffect(() => {
    // ✅ wait until query exists
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }
  
    let path = '';
  
    try {
      // collection reference
      if ('path' in memoizedTargetRefOrQuery) {
        path = memoizedTargetRefOrQuery.path;
      }
      // query reference (Firestore v9 safe access)
      else if ((memoizedTargetRefOrQuery as any)?._query?.path) {
        path =
          (memoizedTargetRefOrQuery as any)._query.path.canonicalString();
      }
    } catch (e) {
      setIsLoading(false);
      return;
    }
  
    // ✅ BLOCK ROOT DATABASE ACCESS
    if (!path || path === '/' || path.split('/').length < 1) {
      setIsLoading(false);
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          ...(doc.data() as T),
          id: doc.id,
        }));
  
        setData(results);
        setIsLoading(false);
        setError(null);
      },
      (firebaseError) => {
        console.error("🔥 Firestore network error:", firebaseError);
  
        // Only report as a permission error if that is the actual code
        if (firebaseError.code === 'permission-denied') {
          const contextualError = new FirestorePermissionError({
            operation: "list",
            path,
          });
          setError(contextualError);
          errorEmitter.emit("permission-error", contextualError);
        } else {
          // Otherwise, report the actual Firestore error (e.g. Missing Index)
          setError(firebaseError);
        }
        
        setData(null);
        setIsLoading(false);
      }
    );
  
    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);
  
  
  // ✅ enforce memoization to prevent infinite render loops
  if (memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(
      "Firestore query must be memoized using useMemoFirebase"
    );
  }
  
  return { data, isLoading, error };
}
