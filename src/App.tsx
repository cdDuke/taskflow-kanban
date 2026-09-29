import { useEffect, useRef, useState } from 'react';
import { useStore } from './store';
import { docTitle, useT } from './i18n';
import type { Priority } from './types';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import BoardView from './components/BoardView';
import TaskDrawer from './components/TaskDrawer';

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

export default function App() {
  const t = useT();
  const theme = useStore((s) => s.theme);
  const lang = useStore((s) => s.lang);
  const activeId = useStore((s) => s.activeId);
  const undo = useStore((s) => s.undo);
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState<Priority | 'all'>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawer, setDrawer] = useState<{ id: string | null; open: boolean }>({ id: null, open: false });
  const [composeSignal, setComposeSignal] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number>(undefined);
  const searchRef = useRef<HTMLInputElement>(null);

  // theme + language live on <html> so CSS and screen readers pick them up
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0e0f13' : '#f4f5f7');
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = docTitle(lang);
  }, [lang]);

  // switching boards closes the task panel and clears filters
  useEffect(() => {
    setDrawer((d) => ({ ...d, open: false }));
    setQuery('');
    setPriority('all');
  }, [activeId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (isTyping(e.target)) return;
        e.preventDefault();
        undo();
        return;
      }
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key.toLowerCase() === 'n' || e.key.toLowerCase() === 'т') {
        e.preventDefault();
        setComposeSignal((n) => n + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo]);

  const notify = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="app">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="main">
        <Topbar
          ref={searchRef}
          query={query}
          setQuery={setQuery}
          priority={priority}
          setPriority={setPriority}
          onMenu={() => setMenuOpen(true)}
          onNewTask={() => setComposeSignal((n) => n + 1)}
        />
        <BoardView query={query} priority={priority} composeSignal={composeSignal} onOpen={(id) => setDrawer({ id, open: true })} />
      </main>

      <TaskDrawer
        taskId={drawer.id}
        open={drawer.open}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
        onDeleted={() => {
          setDrawer({ id: null, open: false });
          notify(t('deleted'));
        }}
      />

      <div className={`toast${toast ? ' is-visible' : ''}`} role="status" aria-live="polite">
        <span>{toast}</span>
        {toast && (
          <button
            className="toast__undo"
            onClick={() => {
              undo();
              setToast(null);
            }}
          >
            {t('undo')}
          </button>
        )}
      </div>
    </div>
  );
}
