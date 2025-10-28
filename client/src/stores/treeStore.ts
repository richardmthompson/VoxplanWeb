import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface Goal {
  id: number;
  name: string;
  details: string;
  parentId: number | null;
  totalheight: number;
  position: { x: number; y: number };
}

interface TreeState {
  goals: Map<number, Goal>;
  nextId: number;
  activeGoalId: number | null;
  rootId: number | null;
  
  addGoal: (name: string, details: string, parentId: number | null) => number;
  updateGoal: (id: number, updates: Partial<Goal>) => void;
  deleteGoal: (id: number) => void;
  setActiveGoal: (id: number | null) => void;
  getGoal: (id: number) => Goal | undefined;
  getChildren: (id: number) => Goal[];
  getParent: (id: number) => Goal | null;
  getSiblings: (id: number) => Goal[];
  navigateUp: () => void;
  navigateDown: () => void;
  navigateLeft: () => void;
  navigateRight: () => void;
  clear: () => void;
  loadTree: (root: Goal, allGoals: Goal[], nextId: number) => void;
}

export const useTreeStore = create<TreeState>()(
  immer((set, get) => ({
    goals: new Map(),
    nextId: 0,
    activeGoalId: null,
    rootId: null,

    addGoal: (name: string, details: string, parentId: number | null) => {
      const state = get();
      const id = state.nextId;
      
      const parent = parentId !== null ? state.goals.get(parentId) : null;
      const depth = parent && parentId !== null ? (state.getChildren(parentId).length || 0) : 0;
      const totalheight = parent ? parent.totalheight * 0.9 : 109.6;
      
      const newGoal: Goal = {
        id,
        name,
        details,
        parentId,
        totalheight,
        position: { x: 0, y: 0 }
      };

      set(state => {
        state.goals.set(id, newGoal);
        state.nextId = id + 1;
        state.activeGoalId = id;
        
        if (parentId === null) {
          state.rootId = id;
        }
      });

      return id;
    },

    updateGoal: (id: number, updates: Partial<Goal>) => {
      set(state => {
        const goal = state.goals.get(id);
        if (goal) {
          state.goals.set(id, { ...goal, ...updates });
        }
      });
    },

    deleteGoal: (id: number) => {
      const state = get();
      const goal = state.goals.get(id);
      
      if (!goal || id === state.rootId) return;

      const parent = goal.parentId !== null ? state.goals.get(goal.parentId) : null;
      const siblings = state.getSiblings(id);
      
      let newActiveId: number | null = null;
      if (siblings.length > 0) {
        const currentIndex = siblings.findIndex(s => s.id === id);
        if (currentIndex > 0) {
          newActiveId = siblings[currentIndex - 1].id;
        } else if (currentIndex < siblings.length - 1) {
          newActiveId = siblings[currentIndex + 1].id;
        } else {
          newActiveId = parent?.id ?? null;
        }
      } else {
        newActiveId = parent?.id ?? null;
      }

      set(state => {
        state.goals.delete(id);
        state.activeGoalId = newActiveId;
      });
    },

    setActiveGoal: (id: number | null) => {
      set(state => {
        state.activeGoalId = id;
      });
    },

    getGoal: (id: number) => {
      return get().goals.get(id);
    },

    getChildren: (id: number) => {
      const goals = Array.from(get().goals.values());
      return goals.filter(g => g.parentId === id).sort((a, b) => a.id - b.id);
    },

    getParent: (id: number) => {
      const goal = get().goals.get(id);
      if (!goal || goal.parentId === null) return null;
      return get().goals.get(goal.parentId) ?? null;
    },

    getSiblings: (id: number) => {
      const goal = get().goals.get(id);
      if (!goal) return [];
      
      if (goal.parentId === null) return [];
      
      return get().getChildren(goal.parentId);
    },

    navigateUp: () => {
      const state = get();
      if (state.activeGoalId === null) return;
      
      const parent = state.getParent(state.activeGoalId);
      if (parent) {
        set({ activeGoalId: parent.id });
      }
    },

    navigateDown: () => {
      const state = get();
      if (state.activeGoalId === null) return;
      
      const children = state.getChildren(state.activeGoalId);
      if (children.length > 0) {
        set({ activeGoalId: children[0].id });
      }
    },

    navigateLeft: () => {
      const state = get();
      if (state.activeGoalId === null) return;
      
      const siblings = state.getSiblings(state.activeGoalId);
      const currentIndex = siblings.findIndex(s => s.id === state.activeGoalId);
      
      if (currentIndex > 0) {
        set({ activeGoalId: siblings[currentIndex - 1].id });
      }
    },

    navigateRight: () => {
      const state = get();
      if (state.activeGoalId === null) return;
      
      const siblings = state.getSiblings(state.activeGoalId);
      const currentIndex = siblings.findIndex(s => s.id === state.activeGoalId);
      
      if (currentIndex >= 0 && currentIndex < siblings.length - 1) {
        set({ activeGoalId: siblings[currentIndex + 1].id });
      }
    },

    clear: () => {
      set({
        goals: new Map(),
        nextId: 0,
        activeGoalId: null,
        rootId: null
      });
    },

    loadTree: (root: Goal, allGoals: Goal[], nextId: number) => {
      set(state => {
        state.goals = new Map(allGoals.map(g => [g.id, g]));
        state.nextId = nextId;
        state.rootId = root.id;
        state.activeGoalId = root.id;
      });
    }
  }))
);
