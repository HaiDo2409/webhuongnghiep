import { useState, useCallback } from 'react';

export interface BookmarkItem {
  id: string;
  type: 'career' | 'school';
  name: string;
  subtitle?: string;
  tag?: string;
  color?: string;
  savedAt: number; // timestamp
}

const STORAGE_KEY = 'hn_bookmarks';

function load(): BookmarkItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(items: BookmarkItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => load());

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((b) => b.id === id),
    [bookmarks],
  );

  const toggle = useCallback((item: BookmarkItem) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id);
      const next = exists ? prev.filter((b) => b.id !== item.id) : [...prev, { ...item, savedAt: Date.now() }];
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      save(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    save([]);
    setBookmarks([]);
  }, []);

  return { bookmarks, isBookmarked, toggle, remove, clearAll };
}
