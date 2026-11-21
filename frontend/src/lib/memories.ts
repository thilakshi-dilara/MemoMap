import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

export type MemoryMedia = { id: string; type: 'IMAGE' | 'VIDEO'; url: string; thumbnailUrl: string | null; sortOrder: number };
export type Memory = {
  id: string;
  title: string;
  description: string | null;
  memoryDate: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  isFavorite: boolean;
  media: MemoryMedia[];
  createdAt: string;
  updatedAt: string;
};
export type MemoryInput = {
  title: string;
  description?: string | null;
  memoryDate: string;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isFavorite?: boolean;
  photoUrls?: string[];
};
type Page = { data: Memory[]; meta: { page: number; totalPages: number; total: number } };

export async function fetchAllMemories(): Promise<Memory[]> {
  const all: Memory[] = [];
  for (let page = 1; ; page += 1) {
    const result = await api<Page>(`/memories?limit=100&page=${page}`);
    all.push(...result.data);
    if (page >= result.meta.totalPages) return all;
  }
}

export const getMemory = (id: string) => api<Memory>(`/memories/${encodeURIComponent(id)}`);
export const createMemory = (input: MemoryInput) => api<Memory>('/memories', { method: 'POST', body: input });
export const updateMemory = (id: string, input: Partial<MemoryInput>) => api<Memory>(`/memories/${encodeURIComponent(id)}`, { method: 'PATCH', body: input });
export const deleteMemory = (id: string) => api<void>(`/memories/${encodeURIComponent(id)}`, { method: 'DELETE' });

export function useMemories() {
  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    fetchAllMemories().then(
      (result) => active && setMemories(result),
      (reason: Error) => active && setError(reason.message),
    );
    return () => { active = false; };
  }, [attempt]);
  const reload = useCallback(() => {
    setError(null);
    setMemories(null);
    setAttempt((value) => value + 1);
  }, []);
  return { memories, error, reload };
}

export const hasCoords = (memory: Memory): memory is Memory & { latitude: number; longitude: number } => memory.latitude !== null && memory.longitude !== null;
export const coverOf = (memory: Memory) => memory.media.find((media) => media.type === 'IMAGE')?.url ?? null;
export const placeOf = (memory: Memory) => memory.locationName?.split(',')[0]?.trim() || 'Somewhere';

export function formatDate(iso: string, style: 'short' | 'long' | 'month' = 'short') {
  const options: Intl.DateTimeFormatOptions = style === 'long' ? { day: 'numeric', month: 'long', year: 'numeric' } : style === 'month' ? { month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(iso).toLocaleDateString('en-GB', { ...options, timeZone: 'UTC' });
}

export function placesCount(memories: Memory[]) {
  return new Set(memories.map((memory) => memory.locationName?.trim().toLowerCase()).filter(Boolean)).size;
}

export function photosCount(memories: Memory[]) {
  return memories.reduce((total, memory) => total + memory.media.length, 0);
}

export function sinceJoined(createdAt?: string) {
  if (!createdAt) return '—';
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
  if (days < 1) return 'Today';
  if (days < 30) return `${days} day${days === 1 ? '' : 's'}`;
  const months = Math.floor(days / 30.4);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'}`;
}

export function matchesQuery(memory: Memory, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [memory.title, memory.locationName, memory.description].some((value) => value?.toLowerCase().includes(q));
}
