'use client';

import { create } from 'zustand';

export type EditorPanel = 'properties' | 'slides';

type DragState = {
  blockId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

type ResizeState = {
  blockId: string;
  handle: string;
  startWidth: number;
  startHeight: number;
  currentWidth: number;
  currentHeight: number;
};

type EditorState = {
  selectedSlideId: string | null;
  selectedBlockIds: string[];
  dragState: DragState | null;
  resizeState: ResizeState | null;
  zoomLevel: number;
  canvasScrollPosition: { x: number; y: number };
  isPanelOpen: Record<EditorPanel, boolean>;

  selectSlide: (id: string | null) => void;
  selectBlock: (id: string | null, addToSelection?: boolean) => void;
  clearSelection: () => void;
  startDrag: (blockId: string, startX: number, startY: number) => void;
  updateDrag: (currentX: number, currentY: number) => void;
  endDrag: () => void;
  startResize: (
    blockId: string,
    handle: string,
    startWidth: number,
    startHeight: number
  ) => void;
  updateResize: (currentWidth: number, currentHeight: number) => void;
  endResize: () => void;
  setZoom: (level: number) => void;
  setCanvasScroll: (x: number, y: number) => void;
  togglePanel: (panel: EditorPanel) => void;
  resetForDeck: () => void;
};

const defaultPanelOpen: Record<EditorPanel, boolean> = {
  properties: true,
  slides: true,
};

export const useEditorStore = create<EditorState>()((set) => ({
  selectedSlideId: null,
  selectedBlockIds: [],
  dragState: null,
  resizeState: null,
  zoomLevel: 1,
  canvasScrollPosition: { x: 0, y: 0 },
  isPanelOpen: defaultPanelOpen,

  selectSlide: (id) =>
    set((state) => ({
      selectedSlideId: id,
      selectedBlockIds: id !== state.selectedSlideId ? [] : state.selectedBlockIds,
    })),

  selectBlock: (id, addToSelection) =>
    set((state) => {
      if (id === null) return { selectedBlockIds: [] };
      if (addToSelection) {
        const next = state.selectedBlockIds.includes(id)
          ? state.selectedBlockIds.filter((x) => x !== id)
          : [...state.selectedBlockIds, id];
        return { selectedBlockIds: next };
      }
      return { selectedBlockIds: [id] };
    }),

  clearSelection: () =>
    set({ selectedSlideId: null, selectedBlockIds: [] }),

  startDrag: (blockId, startX, startY) =>
    set({
      dragState: {
        blockId,
        startX,
        startY,
        currentX: startX,
        currentY: startY,
      },
    }),

  updateDrag: (currentX, currentY) =>
    set((state) =>
      state.dragState
        ? {
            dragState: {
              ...state.dragState,
              currentX,
              currentY,
            },
          }
        : state
    ),

  endDrag: () => set({ dragState: null }),

  startResize: (blockId, handle, startWidth, startHeight) =>
    set({
      resizeState: {
        blockId,
        handle,
        startWidth,
        startHeight,
        currentWidth: startWidth,
        currentHeight: startHeight,
      },
    }),

  updateResize: (currentWidth, currentHeight) =>
    set((state) =>
      state.resizeState
        ? {
            resizeState: {
              ...state.resizeState,
              currentWidth,
              currentHeight,
            },
          }
        : state
    ),

  endResize: () => set({ resizeState: null }),

  setZoom: (level) => set({ zoomLevel: Math.min(2, Math.max(0.25, level)) }),

  setCanvasScroll: (x, y) => set({ canvasScrollPosition: { x, y } }),

  togglePanel: (panel) =>
    set((state) => ({
      isPanelOpen: {
        ...state.isPanelOpen,
        [panel]: !state.isPanelOpen[panel],
      },
    })),

  resetForDeck: () =>
    set({
      selectedSlideId: null,
      selectedBlockIds: [],
      dragState: null,
      resizeState: null,
    }),
}));
