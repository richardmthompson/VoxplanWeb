import { create } from 'zustand';

type Mode = 'command' | 'navigate' | 'voice';

interface UIState {
  mode: Mode;
  commandPanelVisible: boolean;
  attributePanelVisible: boolean;
  setMode: (mode: Mode) => void;
  toggleCommandPanel: () => void;
  toggleAttributePanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  mode: 'navigate',
  commandPanelVisible: true,
  attributePanelVisible: true,

  setMode: (mode: Mode) => set({ mode }),
  
  toggleCommandPanel: () =>
    set((state) => ({ commandPanelVisible: !state.commandPanelVisible })),
  
  toggleAttributePanel: () =>
    set((state) => ({ attributePanelVisible: !state.attributePanelVisible })),
}));
