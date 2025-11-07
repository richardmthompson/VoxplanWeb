import { create } from 'zustand';

export type LayoutMode = 'tree' | 'spider' | 'vertical';

export interface Goal {
  id: number;
  name: string;
  details: string;
  parentId: number | null;
  totalheight: number;
  position: { x: number; y: number };
  manualPositions?: {
    tree?: { x: number; y: number };
    spider?: { x: number; y: number };
    vertical?: { x: number; y: number };
  };
  dragLocked?: boolean; // When true, dragging this node also moves its children
}

interface TreeState {
  goals: Map<number, Goal>;
  nextId: number;
  activeGoalId: number | null;
  rootId: number | null;
  layoutMode: LayoutMode;
  
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
  setLayoutMode: (mode: LayoutMode) => void;
  clearAllPositions: () => void;
  clear: () => void;
  loadTree: (root: Goal, allGoals: Goal[], nextId: number, layoutMode?: LayoutMode) => void;
}

export const useTreeStore = create<TreeState>()((set, get) => ({
    goals: new Map(),
    nextId: 0,
    activeGoalId: null,
    rootId: null,
    layoutMode: 'tree',

    addGoal: (name: string, details: string, parentId: number | null) => {
      const state = get();
      const id = state.nextId;
      
      const parent = parentId !== null ? state.goals.get(parentId) : null;
      
      // Calculate depth (how many levels deep from root)
      const calculateDepth = (goalId: number | null): number => {
        if (goalId === null) return 0;
        const goal = state.goals.get(goalId);
        if (!goal) return 0;
        return 1 + calculateDepth(goal.parentId);
      };
      
      const depth = calculateDepth(parentId);
      
      // Dramatic size reduction by depth: root=110, level1=75%, level2=60%, level3=48%, level4+=40%
      const sizeMultipliers = [1.0, 0.75, 0.60, 0.48, 0.40];
      const multiplier = sizeMultipliers[Math.min(depth, sizeMultipliers.length - 1)];
      const totalheight = 110 * multiplier;
      
      const newGoal: Goal = {
        id,
        name,
        details,
        parentId,
        totalheight,
        position: { x: 0, y: 0 },
        manualPositions: {},
        dragLocked: true // Default to locked (children move with parent)
      };

      const newGoals = new Map(state.goals);
      newGoals.set(id, newGoal);

      set({
        goals: newGoals,
        nextId: id + 1,
        activeGoalId: id,
        rootId: parentId === null ? id : state.rootId,
      });

      return id;
    },

    updateGoal: (id: number, updates: Partial<Goal>) => {
      const state = get();
      const goal = state.goals.get(id);
      if (goal) {
        const newGoals = new Map(state.goals);
        newGoals.set(id, { ...goal, ...updates });
        set({ goals: newGoals });
      }
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

      const newGoals = new Map(state.goals);
      newGoals.delete(id);
      set({ goals: newGoals, activeGoalId: newActiveId });
    },

    setActiveGoal: (id: number | null) => {
      set({ activeGoalId: id });
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

    setLayoutMode: (mode: LayoutMode) => {
      set({ layoutMode: mode });
    },

    clearAllPositions: () => {
      const state = get();
      const newGoals = new Map(state.goals);
      
      newGoals.forEach((goal, id) => {
        newGoals.set(id, { ...goal, position: { x: 0, y: 0 }, manualPositions: {} });
      });
      
      set({ goals: newGoals });
    },

    clear: () => {
      set({
        goals: new Map(),
        nextId: 0,
        activeGoalId: null,
        rootId: null,
        layoutMode: 'tree'
      });
    },

    loadTree: (root: Goal, allGoals: Goal[], nextId: number, layoutMode: LayoutMode = 'tree') => {
      set({
        goals: new Map(allGoals.map(g => [g.id, g])),
        nextId,
        rootId: root.id,
        activeGoalId: root.id,
        layoutMode,
      });
    }
  }));
