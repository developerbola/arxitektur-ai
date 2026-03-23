import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Point2D } from '../utils/geometry';

export type Wall = {
  id: string;
  startPointId: string;
  endPointId: string;
  thickness: number;
  isExterior: boolean;
};

export type Opening = {
  id: string;
  type: 'door' | 'window';
  wallId: string;
  distanceFromStart: number;
  width: number;
  swingDirection?: 'left_in' | 'right_in' | 'left_out' | 'right_out';
};

export type Room = {
  id: string;
  name: string;
  wallNodes: string[];
  computedAreaSqM: number;
};

export type CanvasElement = {
  id: string;
  type: 'room' | 'door' | 'window' | 'wall' | string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  metadata: any;
};

export type ToolType = 'select' | 'wall' | 'door' | 'window' | 'room' | 'move';

interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FloorPlanTopology {
  points: Record<string, Point2D>;
  walls: Record<string, Wall>;
  openings: Record<string, Opening>;
  rooms: Record<string, Room>;
}

interface ProjectState {
  currentProject: { id: string; name: string } | null;
  
  // The new Architectural Graph State
  topology: FloorPlanTopology;
  
  // Undo/Redo Stacks
  past: FloorPlanTopology[];
  future: FloorPlanTopology[];
  
  // UI State
  selectedTool: ToolType;
  zoomLevel: number;
  pixelsPerMeter: number;
  selectedElementIds: string[]; // Can be IDs of walls, points, openings, etc.
  aiChatHistory: AssistantMessage[];
  
  // Simple Project Actions
  setProject: (project: { id: string; name: string } | null) => void;
  setTopology: (newTopology: FloorPlanTopology) => void;
  updateTopology: (updater: (prev: FloorPlanTopology) => FloorPlanTopology) => void;
  clearTopology: () => void;
  
  // Backwards compatibility for Rectangle model CanvasEditor
  canvasElements: CanvasElement[];
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElements: (ids: string[]) => void;
  setCanvasElements: (elements: CanvasElement[]) => void;
  
  // UI Actions
  setSelectedTool: (tool: ToolType) => void;
  setZoomLevel: (zoom: number) => void;
  setPixelsPerMeter: (val: number) => void;
  setSelectedElementIds: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Sub-Actions directly modifying graph parts
  addPoint: (p: Point2D) => void;
  addWall: (w: Wall) => void;
  addOpening: (o: Opening) => void;
  
  // AI Chat
  addChatMessage: (message: AssistantMessage) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
}

const emptyTopology: FloorPlanTopology = { points: {}, walls: {}, openings: {}, rooms: {} };

export const useStore = create<ProjectState>()(
  persist(
    (set) => ({
      currentProject: { id: 'default', name: 'Untitled Project' },
      topology: emptyTopology,
      past: [],
      future: [],
      selectedTool: 'select',
      zoomLevel: 1,
      pixelsPerMeter: 50,
      selectedElementIds: [],
      aiChatHistory: [
        { role: 'assistant', content: 'Hello! I am your architectural assistant. The system has been upgraded to true architectural walls!' }
      ],

      setProject: (project) => set({ currentProject: project }),
      
      setTopology: (newTopology) => set((state) => ({ 
        past: [...state.past, state.topology],
        future: [],
        topology: newTopology 
      })),

      updateTopology: (updater) => set((state) => ({
        past: [...state.past, state.topology],
        future: [],
        topology: updater(state.topology),
      })),

      clearTopology: () => set((state) => ({ 
        past: [...state.past, state.topology],
        future: [],
        topology: emptyTopology 
      })),
      
      canvasElements: [],
      
      addElement: (element) => set((state) => ({ 
        canvasElements: [...state.canvasElements, element] 
      })),
      
      updateElement: (id, updates) => set((state) => ({
        canvasElements: state.canvasElements.map((el) => 
          el.id === id ? { ...el, ...updates } : el
        )
      })),
      
      removeElements: (ids) => set((state) => ({
        canvasElements: state.canvasElements.filter((el) => !ids.includes(el.id)),
        selectedElementIds: state.selectedElementIds.filter((id) => !ids.includes(id))
      })),
      
      setCanvasElements: (elements) => set({ canvasElements: elements }),
      
      addPoint: (p) => set((state) => {
        const newTopology = { ...state.topology, points: { ...state.topology.points, [p.id]: p } };
        return {
          past: [...state.past, state.topology],
          future: [],
          topology: newTopology
        };
      }),

      addWall: (w) => set((state) => {
        const newTopology = { ...state.topology, walls: { ...state.topology.walls, [w.id]: w } };
        return {
          past: [...state.past, state.topology],
          future: [],
          topology: newTopology
        };
      }),

      addOpening: (o) => set((state) => {
        const newTopology = { ...state.topology, openings: { ...state.topology.openings, [o.id]: o } };
        return {
          past: [...state.past, state.topology],
          future: [],
          topology: newTopology
        };
      }),

      setSelectedTool: (tool) => set({ selectedTool: tool }),
      setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.05, zoom) }),
      setPixelsPerMeter: (val) => set({ pixelsPerMeter: val }),
      setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),
      clearSelection: () => set({ selectedElementIds: [] }),
      
      addChatMessage: (message) => set((state) => ({
        aiChatHistory: [...state.aiChatHistory, message]
      })),

      undo: () => set((state) => {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, state.past.length - 1);
        return {
          past: newPast,
          future: [state.topology, ...state.future],
          topology: previous,
        };
      }),

      redo: () => set((state) => {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        return {
          past: [...state.past, state.topology],
          future: newFuture,
          topology: next,
        };
      }),
    }),
    {
      name: 'arxitektur-cad-storage', // Intentionally renamed to reset broken local storage from old rectangle model
      partialize: (state) => ({ topology: state.topology, currentProject: state.currentProject, canvasElements: state.canvasElements }),
    }
  )
);
