import { useEffect, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useBackend } from '@/lib/runtime';

export interface BookmarkItem {
  id: string; type: 'career' | 'school'; name: string; subtitle?: string; tag?: string; color?: string; savedAt: number;
}
const STORAGE_KEY = 'hn_bookmarks';
const EMPTY: BookmarkItem[] = [];
const snapshots = new Map<string, BookmarkItem[]>();
const listeners = new Set<() => void>();
const loading = new Set<string>();
const loaded = new Set<string>();
const queues = new Map<string, Promise<void>>();
function guestItems(): BookmarkItem[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((b): b is BookmarkItem => b && typeof b.id === 'string' && typeof b.name === 'string' && ['career', 'school'].includes(b.type)) : [];
  } catch { return []; }
}
function snapshot(key: string) { return snapshots.get(key) ?? EMPTY; }
function write(key: string, items: BookmarkItem[]) {
  snapshots.set(key, items);
  if (key === 'guest') localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  listeners.forEach(listener => listener());
}
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function enqueue(key: string, work: () => Promise<void>) {
  const next = (queues.get(key) ?? Promise.resolve()).then(work).catch(() => { toast.error('Chưa lưu được yêu thích. Hãy thử lại.'); });
  queues.set(key, next);
}

export function useBookmarks() {
  const auth = useAuth();
  const key = useBackend && auth?.isAuthenticated ? auth.user.id : 'guest';
  const bookmarks = useSyncExternalStore(subscribe, () => snapshot(key));
  useEffect(() => {
    if (key === 'guest') {
      if (!snapshots.has(key)) write(key, guestItems());
      return;
    }
    if (loaded.has(key) || loading.has(key)) return;
    loading.add(key);
    enqueue(key, async () => {
      try {
        const remote = (await api.get<BookmarkItem[]>('/api/me/bookmarks')).data;
        const merged = new Map(remote.map(item => [item.id, item]));
        for (const item of guestItems().slice(0, 200)) {
          if (!merged.has(item.id)) { await api.post('/api/me/bookmarks', item); merged.set(item.id, item); }
        }
        write(key, [...merged.values()]); loaded.add(key); write('guest', []);
      } finally { loading.delete(key); }
    });
  }, [key]);
  return {
    bookmarks,
    isBookmarked: (id: string) => bookmarks.some(item => item.id === id),
    toggle: (item: Omit<BookmarkItem, 'savedAt'> & { savedAt?: number }) => enqueue(key, async () => {
      const previous = snapshot(key); const exists = previous.some(b => b.id === item.id);
      const saved = { ...item, savedAt: Date.now() };
      if (key !== 'guest') {
        if (exists) await api.delete(`/api/me/bookmarks/${encodeURIComponent(item.id)}`);
        else await api.post('/api/me/bookmarks', saved);
      }
      write(key, exists ? previous.filter(b => b.id !== item.id) : [...previous, saved]);
    }),
    remove: (id: string) => enqueue(key, async () => {
      if (key !== 'guest') await api.delete(`/api/me/bookmarks/${encodeURIComponent(id)}`);
      write(key, snapshot(key).filter(b => b.id !== id));
    }),
    clearAll: () => enqueue(key, async () => {
      if (key !== 'guest') await api.delete('/api/me/bookmarks');
      write(key, []);
    }),
  };
}
