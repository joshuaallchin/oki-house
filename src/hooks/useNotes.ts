import { useState, useEffect, useCallback } from 'react';

export interface Note {
  id: string;
  propertyId: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyStatus {
  status: 'none' | 'interested' | 'visited' | 'applied' | 'passed';
}

const STORAGE_KEYS = {
  notes: 'okinoshima-notes',
  favorites: 'okinoshima-favorites',
  ratings: 'okinoshima-ratings',
  statuses: 'okinoshima-statuses',
};

export function useNotes() {
  // Notes state
  const [notesMap, setNotesMap] = useState<Record<number, Note[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.notes);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Favorites state
  const [favorites, setFavorites] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.favorites);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Ratings state
  const [ratings, setRatings] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ratings);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Statuses state
  const [statuses, setStatuses] = useState<Record<number, PropertyStatus['status']>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.statuses);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notesMap));
  }, [notesMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ratings, JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.statuses, JSON.stringify(statuses));
  }, [statuses]);

  // Note functions
  const addNote = useCallback((propertyId: number, text: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      propertyId,
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setNotesMap(prev => ({
      ...prev,
      [propertyId]: [...(prev[propertyId] || []), newNote],
    }));
  }, []);

  const updateNote = useCallback((propertyId: number, noteId: string, text: string) => {
    setNotesMap(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] || []).map(note =>
        note.id === noteId
          ? { ...note, text, updatedAt: new Date().toISOString() }
          : note
      ),
    }));
  }, []);

  const deleteNote = useCallback((propertyId: number, noteId: string) => {
    setNotesMap(prev => ({
      ...prev,
      [propertyId]: (prev[propertyId] || []).filter(note => note.id !== noteId),
    }));
  }, []);

  const getNotesForProperty = useCallback((propertyId: number): Note[] => {
    return notesMap[propertyId] || [];
  }, [notesMap]);

  // Favorite functions
  const toggleFavorite = useCallback((propertyId: number) => {
    setFavorites(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId],
    }));
  }, []);

  // Rating functions
  const setRating = useCallback((propertyId: number, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [propertyId]: rating,
    }));
  }, []);

  // Status functions
  const setStatus = useCallback((propertyId: number, status: PropertyStatus['status']) => {
    setStatuses(prev => ({
      ...prev,
      [propertyId]: status,
    }));
  }, []);

  return {
    // Notes
    notesMap,
    addNote,
    updateNote,
    deleteNote,
    getNotesForProperty,
    
    // Favorites
    favorites,
    toggleFavorite,
    
    // Ratings
    ratings,
    setRating,
    
    // Statuses
    statuses,
    setStatus,
  };
}
