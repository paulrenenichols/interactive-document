'use client';

import { create } from 'zustand';

/** Placeholder for editor actions (move block, resize, edit content, etc.). */
export type EditorAction =
  | { type: 'move-block'; blockId: string; from: [number, number]; to: [number, number] }
  | { type: 'resize-block'; blockId: string; from: [number, number]; to: [number, number] }
  | { type: 'edit-content'; blockId: string; from: string; to: string }
  | { type: 'delete-block'; blockId: string }
  | { type: 'add-block'; blockId: string }
  | { type: 'reorder-slides'; from: number[]; to: number[] };

type HistoryState = {
  past: EditorAction[];
  future: EditorAction[];

  push: (action: EditorAction) => void;
  undo: () => EditorAction | null;
  redo: () => EditorAction | null;
  clear: () => void;
};

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  past: [],
  future: [],

  push: (action) =>
    set((state) => ({
      past: [...state.past, action],
      future: [],
    })),

  undo: () => {
    const state = get();
    if (state.past.length === 0) return null;
    const last = state.past[state.past.length - 1];
    set({
      past: state.past.slice(0, -1),
      future: [last, ...state.future],
    });
    return last;
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return null;
    const first = state.future[0];
    set({
      past: [...state.past, first],
      future: state.future.slice(1),
    });
    return first;
  },

  clear: () => set({ past: [], future: [] }),
}));

/** Selectors for derived state */
export const selectCanUndo = (s: HistoryState) => s.past.length > 0;
export const selectCanRedo = (s: HistoryState) => s.future.length > 0;
