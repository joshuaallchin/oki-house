import { useState, useEffect, useCallback } from 'react';

export interface Note {
  id: string;
  propertyId: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyRating {
  propertyId: number;
  rating: number; // 1-5 stars
  favorite: boolean;
  status: 'interested' | 'visited' | 'applied' | 'rejected' | 'none';
}

const NOTES_KEY = 'okinoshima-house-notes';
const RATINGS_KEY = 'okinoshima-house-ratings';

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadRatings(): PropertyRating[] {
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [ratings, setRatings] = useState<PropertyRating[]>(loadRatings);

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  }, [ratings]);

  const addNote = useCallback((propertyId: number, text: string) => {
    const now = new Date().toISOString();
    const note: Note = {
      id: crypto.randomUUID(),
      propertyId,
      text,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [note, ...prev]);
  }, []);

  const updateNote = useCallback((noteId: string, text: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === noteId ? { ...n, text, updatedAt: new Date().toISOString() } : n
      )
    );
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const getNotesForProperty = useCallback(
    (propertyId: number) => notes.filter((n) => n.propertyId === propertyId),
    [notes]
  );

  const getRating = useCallback(
    (propertyId: number): PropertyRating => {
      return (
        ratings.find((r) => r.propertyId === propertyId) || {
          propertyId,
          rating: 0,
          favorite: false,
          status: 'none',
        }
      );
    },
    [ratings]
  );

  const setRating = useCallback((propertyId: number, rating: number) => {
    setRatings((prev) => {
      const existing = prev.find((r) => r.propertyId === propertyId);
      if (existing) {
        return prev.map((r) =>
          r.propertyId === propertyId ? { ...r, rating } : r
        );
      }
      return [...prev, { propertyId, rating, favorite: false, status: 'none' as const }];
    });
  }, []);

  const toggleFavorite = useCallback((propertyId: number) => {
    setRatings((prev) => {
      const existing = prev.find((r) => r.propertyId === propertyId);
      if (existing) {
        return prev.map((r) =>
          r.propertyId === propertyId ? { ...r, favorite: !r.favorite } : r
        );
      }
      return [...prev, { propertyId, rating: 0, favorite: true, status: 'none' as const }];
    });
  }, []);

  const setStatus = useCallback(
    (propertyId: number, status: PropertyRating['status']) => {
      setRatings((prev) => {
        const existing = prev.find((r) => r.propertyId === propertyId);
        if (existing) {
          return prev.map((r) =>
            r.propertyId === propertyId ? { ...r, status } : r
          );
        }
        return [...prev, { propertyId, rating: 0, favorite: false, status }];
      });
    },
    []
  );

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    getNotesForProperty,
    getRating,
    setRating,
    toggleFavorite,
    setStatus,
    ratings,
  };
}
