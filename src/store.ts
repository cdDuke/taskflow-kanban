import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { seedBoards, uid } from './seed';
import type { Board, Lang, Priority, Task, Theme } from './types';

const HISTORY_LIMIT = 40;

const initialLang = (): Lang => {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'ru' || saved === 'en') return saved;
  } catch {
    /* storage blocked */
  }
  return 'ru';
};

const initialTheme = (): Theme =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

type State = {
  boards: Board[];
  activeId: string;
  lang: Lang;
  theme: Theme;
  history: Board[][];
  /** true while the demo boards are untouched — they then follow the UI language */
  pristine: boolean;

  setLang: (l: Lang) => void;
  toggleTheme: () => void;
  setActive: (id: string) => void;
  undo: () => void;
  resetDemo: () => void;

  addBoard: (name: string) => void;
  renameBoard: (name: string) => void;
  deleteBoard: (id: string) => void;

  addColumn: (title: string) => void;
  renameColumn: (colId: string, title: string) => void;

  addTask: (colId: string, title: string) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, toColId: string, toIndex: number, record?: boolean) => void;
  snapshot: () => void;

  addChecklistItem: (taskId: string, text: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  removeChecklistItem: (taskId: string, itemId: string) => void;
};

const lang0 = initialLang();
const boards0 = seedBoards(lang0);

export const useStore = create<State>()(
  persist(
    (set, get) => {
      /** Apply a change to a deep copy of the active board and remember the previous state for undo. */
      const mutate = (fn: (b: Board) => void, record = true) => {
        const { boards, activeId, history } = get();
        const next = structuredClone(boards);
        const board = next.find((b) => b.id === activeId);
        if (!board) return;
        fn(board);
        set({ boards: next, history: record ? [...history, boards].slice(-HISTORY_LIMIT) : history, pristine: false });
      };

      return {
        boards: boards0,
        activeId: boards0[0].id,
        lang: lang0,
        theme: initialTheme(),
        history: [],
        pristine: true,

        setLang: (lang) => {
          try {
            localStorage.setItem('lang', lang);
          } catch {
            /* ignore */
          }
          if (get().pristine) {
            const index = Math.max(0, get().boards.findIndex((b) => b.id === get().activeId));
            const boards = seedBoards(lang);
            set({ lang, boards, activeId: boards[index]?.id ?? boards[0].id, history: [] });
          } else {
            set({ lang });
          }
        },
        toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
        setActive: (activeId) => set({ activeId }),

        undo: () => {
          const { history } = get();
          if (!history.length) return;
          const prev = history[history.length - 1];
          const activeId = prev.some((b) => b.id === get().activeId) ? get().activeId : prev[0].id;
          set({ boards: prev, history: history.slice(0, -1), activeId });
        },

        resetDemo: () => {
          const boards = seedBoards(get().lang);
          set({ boards, activeId: boards[0].id, history: [], pristine: true });
        },

        addBoard: (name) => {
          const { boards, history, lang } = get();
          const columns = (lang === 'ru' ? ['К выполнению', 'В работе', 'Готово'] : ['To do', 'In progress', 'Done']).map((title, i) => ({
            id: uid(),
            title,
            color: ['#4f9dff', '#fbbf24', '#34d399'][i],
            taskIds: [],
          }));
          const board: Board = { id: uid(), name, emoji: '📌', columns, tasks: {}, labels: boards[0]?.labels ?? [] };
          set({ boards: [...boards, board], activeId: board.id, history: [...history, boards].slice(-HISTORY_LIMIT), pristine: false });
        },
        renameBoard: (name) => mutate((b) => void (b.name = name)),
        deleteBoard: (id) => {
          const { boards, history, activeId } = get();
          if (boards.length <= 1) return;
          const next = boards.filter((b) => b.id !== id);
          set({ boards: next, history: [...history, boards].slice(-HISTORY_LIMIT), activeId: activeId === id ? next[0].id : activeId, pristine: false });
        },

        addColumn: (title) => mutate((b) => void b.columns.push({ id: uid(), title, color: '#8b90a0', taskIds: [] })),
        renameColumn: (colId, title) =>
          mutate((b) => {
            const col = b.columns.find((c) => c.id === colId);
            if (col) col.title = title;
          }),

        addTask: (colId, title) => {
          const id = uid();
          mutate((b) => {
            b.tasks[id] = { id, title, description: '', labels: [], priority: 'medium' as Priority, checklist: [], assignees: [], createdAt: Date.now() };
            b.columns.find((c) => c.id === colId)?.taskIds.push(id);
          });
          return id;
        },
        updateTask: (id, patch) =>
          mutate((b) => {
            if (b.tasks[id]) b.tasks[id] = { ...b.tasks[id], ...patch };
          }),
        deleteTask: (id) =>
          mutate((b) => {
            delete b.tasks[id];
            b.columns.forEach((c) => (c.taskIds = c.taskIds.filter((t) => t !== id)));
          }),

        // During a drag we move without recording each hover step; the drag start takes one snapshot.
        moveTask: (taskId, toColId, toIndex, record = false) =>
          mutate((b) => {
            b.columns.forEach((c) => (c.taskIds = c.taskIds.filter((t) => t !== taskId)));
            const col = b.columns.find((c) => c.id === toColId);
            if (!col) return;
            col.taskIds.splice(Math.max(0, Math.min(toIndex, col.taskIds.length)), 0, taskId);
          }, record),
        snapshot: () => set({ history: [...get().history, get().boards].slice(-HISTORY_LIMIT), pristine: false }),

        addChecklistItem: (taskId, text) => mutate((b) => void b.tasks[taskId]?.checklist.push({ id: uid(), text, done: false })),
        toggleChecklistItem: (taskId, itemId) =>
          mutate((b) => {
            const item = b.tasks[taskId]?.checklist.find((i) => i.id === itemId);
            if (item) item.done = !item.done;
          }),
        removeChecklistItem: (taskId, itemId) =>
          mutate((b) => {
            const t = b.tasks[taskId];
            if (t) t.checklist = t.checklist.filter((i) => i.id !== itemId);
          }),
      };
    },
    {
      name: 'taskflow-v1',
      partialize: ({ boards, activeId, theme, lang, pristine }) => ({ boards, activeId, theme, lang, pristine }),
    }
  )
);

export const useActiveBoard = () => useStore((s) => s.boards.find((b) => b.id === s.activeId) ?? s.boards[0]);
