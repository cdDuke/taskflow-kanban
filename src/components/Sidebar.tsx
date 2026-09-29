import { useState, type FormEvent } from 'react';
import { useStore } from '../store';
import { useT } from '../i18n';
import type { Lang } from '../types';

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const boards = useStore((s) => s.boards);
  const activeId = useStore((s) => s.activeId);
  const setActive = useStore((s) => s.setActive);
  const addBoard = useStore((s) => s.addBoard);
  const deleteBoard = useStore((s) => s.deleteBoard);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const resetDemo = useStore((s) => s.resetDemo);
  const [draft, setDraft] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = draft?.trim();
    if (v) addBoard(v);
    setDraft(null);
    onClose();
  };

  return (
    <>
      <div className={`scrim${open ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar${open ? ' is-open' : ''}`} aria-label={t('boards')}>
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          TaskFlow
        </div>

        <p className="sidebar__label">{t('boards')}</p>
        <ul className="boards">
          {boards.map((b) => {
            const total = Object.keys(b.tasks).length;
            return (
              <li key={b.id} className={b.id === activeId ? 'is-active' : ''}>
                <button
                  className="boards__item"
                  aria-current={b.id === activeId ? 'page' : undefined}
                  onClick={() => {
                    setActive(b.id);
                    onClose();
                  }}
                >
                  <span className="boards__emoji" aria-hidden="true">{b.emoji}</span>
                  <span className="boards__name">{b.name}</span>
                  <span className="boards__count">{total}</span>
                </button>
                {boards.length > 1 && (
                  <button className="boards__del" aria-label={`${t('deleteBoard')}: ${b.name}`} onClick={() => deleteBoard(b.id)}>
                    ×
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {draft === null ? (
          <button className="sidebar__new" onClick={() => setDraft('')}>
            + {t('newBoard')}
          </button>
        ) : (
          <form className="sidebar__form" onSubmit={submit}>
            <input
              autoFocus
              value={draft}
              placeholder={t('boardName')}
              aria-label={t('boardName')}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setDraft(null)}
              onBlur={() => !draft.trim() && setDraft(null)}
            />
          </form>
        )}

        <div className="shortcuts">
          <p className="sidebar__label">{t('shortcuts')}</p>
          <p>
            <kbd>N</kbd> {t('sc.new')}
          </p>
          <p>
            <kbd>/</kbd> {t('sc.search')}
          </p>
          <p>
            <kbd>Ctrl</kbd>+<kbd>Z</kbd> {t('sc.undo')}
          </p>
        </div>

        <div className="sidebar__foot">
          <div className="seg" role="group" aria-label="Language">
            {(['ru', 'en'] as Lang[]).map((l) => (
              <button key={l} className={l === lang ? 'is-active' : ''} aria-pressed={l === lang} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="icon-btn" onClick={toggleTheme} aria-label={t('theme')} title={t('theme')}>
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <button
            className="icon-btn"
            onClick={() => window.confirm(t('resetConfirm')) && resetDemo()}
            aria-label={t('reset')}
            title={t('reset')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="sidebar__concept">{t('concept')}</p>
      </aside>
    </>
  );
}
