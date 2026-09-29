import { forwardRef, useState } from 'react';
import { useActiveBoard, useStore } from '../store';
import { useT } from '../i18n';
import { PRIORITIES, type Priority } from '../types';

type Props = {
  query: string;
  setQuery: (q: string) => void;
  priority: Priority | 'all';
  setPriority: (p: Priority | 'all') => void;
  onMenu: () => void;
  onNewTask: () => void;
};

const Topbar = forwardRef<HTMLInputElement, Props>(function Topbar({ query, setQuery, priority, setPriority, onMenu, onNewTask }, searchRef) {
  const t = useT();
  const board = useActiveBoard();
  const renameBoard = useStore((s) => s.renameBoard);
  const undo = useStore((s) => s.undo);
  const canUndo = useStore((s) => s.history.length > 0);
  const [editing, setEditing] = useState(false);

  const total = Object.keys(board.tasks).length;
  const done = board.columns.at(-1)?.taskIds.length ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <header className="topbar">
      <div className="topbar__row">
        <button className="icon-btn burger" onClick={onMenu} aria-label={t('menu')}>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="topbar__emoji" aria-hidden="true">{board.emoji}</span>
        {editing ? (
          <input
            className="topbar__rename"
            defaultValue={board.name}
            autoFocus
            aria-label={t('boardName')}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== board.name) renameBoard(v);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        ) : (
          <h1 className="topbar__title" onDoubleClick={() => setEditing(true)} title={t('boardName')}>
            {board.name}
          </h1>
        )}

        <div className="progress" title={t('progress', { done, total })}>
          <div className="progress__bar">
            <span style={{ width: `${pct}%` }} />
          </div>
          <span className="progress__text">{t('progress', { done, total })}</span>
        </div>

        <div className="topbar__actions">
          <button className="btn btn--ghost btn--sm" onClick={undo} disabled={!canUndo} title={t('undoHint')}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hide-sm">{t('undo')}</span>
          </button>
          <button className="btn btn--primary btn--sm" onClick={onNewTask}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span className="hide-sm">{t('newTask')}</span>
          </button>
        </div>
      </div>

      <div className="topbar__row topbar__row--filters">
        <label className="search">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input ref={searchRef} type="search" value={query} placeholder={t('search')} aria-label={t('search')} onChange={(e) => setQuery(e.target.value)} />
          <kbd aria-hidden="true">/</kbd>
        </label>
        <div className="pfilter" role="group" aria-label={t('priority')}>
          <button className={priority === 'all' ? 'is-active' : ''} aria-pressed={priority === 'all'} onClick={() => setPriority('all')}>
            {t('allPriorities')}
          </button>
          {PRIORITIES.map((p) => (
            <button key={p} className={`${priority === p ? 'is-active' : ''} pf--${p}`} aria-pressed={priority === p} onClick={() => setPriority(priority === p ? 'all' : p)}>
              <i aria-hidden="true" />
              {t(`p.${p}`)}
            </button>
          ))}
        </div>
        {(query || priority !== 'all') && (
          <button
            className="link-btn"
            onClick={() => {
              setQuery('');
              setPriority('all');
            }}
          >
            {t('clear')}
          </button>
        )}
      </div>
    </header>
  );
});

export default Topbar;
