import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { useActiveBoard, useStore } from '../store';
import { useLocale, useT } from '../i18n';
import { PRIORITIES } from '../types';

type Props = { taskId: string | null; open: boolean; onClose: () => void; onDeleted: () => void };

export default function TaskDrawer({ taskId, open, onClose, onDeleted }: Props) {
  const t = useT();
  const locale = useLocale();
  const board = useActiveBoard();
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const moveTask = useStore((s) => s.moveTask);
  const addItem = useStore((s) => s.addChecklistItem);
  const toggleItem = useStore((s) => s.toggleChecklistItem);
  const removeItem = useStore((s) => s.removeChecklistItem);
  const task = taskId ? board.tasks[taskId] : null;
  const panelRef = useRef<HTMLElement>(null);
  const [itemDraft, setItemDraft] = useState('');

  const column = task ? board.columns.find((c) => c.taskIds.includes(task.id)) : undefined;
  const team = useMemo(() => [...new Set(Object.values(board.tasks).flatMap((x) => x.assignees))].sort(), [board.tasks]);

  useEffect(() => {
    if (!task || !open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>('.drawer__close')?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
    // re-run only when the drawer opens or a different task is shown
  }, [open, task?.id]);

  const done = task ? task.checklist.filter((i) => i.done).length : 0;

  const submitItem = (e: FormEvent) => {
    e.preventDefault();
    if (task && itemDraft.trim()) addItem(task.id, itemDraft.trim());
    setItemDraft('');
  };

  return (
    <>
      <div className={`scrim scrim--drawer${open ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      {/* clipping layer keeps the off-screen panel from widening the page on mobile */}
      <div className="drawer-layer">
      <aside ref={panelRef} className={`drawer${open ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label={task?.title ?? ''} aria-hidden={!open}>
        {task && (
          <div className="drawer__inner" key={task.id}>
            <div className="drawer__top">
              <span className="drawer__status" style={{ '--c': column?.color } as CSSProperties}>
                {column?.title}
              </span>
              <button className="icon-btn drawer__close" onClick={onClose} aria-label={t('close')}>
                ✕
              </button>
            </div>

            <textarea
              className="drawer__title"
              defaultValue={task.title}
              rows={Math.min(4, Math.max(1, Math.ceil(task.title.length / 30)))}
              aria-label={t('taskTitle')}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== task.title) updateTask(task.id, { title: v });
              }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), (e.target as HTMLTextAreaElement).blur())}
            />

            <dl className="props">
              <dt>{t('status')}</dt>
              <dd>
                <select
                  value={column?.id}
                  onChange={(e) => moveTask(task.id, e.target.value, Infinity, true)}
                  aria-label={t('status')}
                >
                  {board.columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </dd>

              <dt>{t('priority')}</dt>
              <dd>
                <div className="seg seg--prio" role="radiogroup" aria-label={t('priority')}>
                  {PRIORITIES.map((p) => (
                    <button key={p} role="radio" aria-checked={task.priority === p} className={`pf--${p}${task.priority === p ? ' is-active' : ''}`} onClick={() => updateTask(task.id, { priority: p })}>
                      <i aria-hidden="true" />
                      {t(`p.${p}`)}
                    </button>
                  ))}
                </div>
              </dd>

              <dt>{t('due')}</dt>
              <dd>
                <input type="date" value={task.due ?? ''} onChange={(e) => updateTask(task.id, { due: e.target.value || undefined })} aria-label={t('due')} />
              </dd>

              <dt>{t('labels')}</dt>
              <dd className="label-pick">
                {board.labels.map((l) => {
                  const on = task.labels.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      className={`tag tag--pick${on ? ' is-on' : ''}`}
                      style={{ '--c': l.color } as CSSProperties}
                      aria-pressed={on}
                      onClick={() => updateTask(task.id, { labels: on ? task.labels.filter((x) => x !== l.id) : [...task.labels, l.id] })}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </dd>

              {team.length > 0 && (
                <>
                  <dt>{t('assignees')}</dt>
                  <dd className="avatars avatars--pick">
                    {team.map((a) => {
                      const on = task.assignees.includes(a);
                      return (
                        <button
                          key={a}
                          className={on ? 'is-on' : ''}
                          aria-pressed={on}
                          style={{ '--h': [...a].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 360 } as CSSProperties}
                          onClick={() => updateTask(task.id, { assignees: on ? task.assignees.filter((x) => x !== a) : [...task.assignees, a] })}
                        >
                          {a}
                        </button>
                      );
                    })}
                  </dd>
                </>
              )}
            </dl>

            <h3 className="drawer__h">{t('description')}</h3>
            <textarea
              className="drawer__desc"
              defaultValue={task.description}
              placeholder={t('descPlaceholder')}
              rows={4}
              aria-label={t('description')}
              onBlur={(e) => e.target.value !== task.description && updateTask(task.id, { description: e.target.value })}
            />

            <h3 className="drawer__h">
              {t('checklist')}
              {task.checklist.length > 0 && (
                <span>
                  {done}/{task.checklist.length}
                </span>
              )}
            </h3>
            {task.checklist.length > 0 && (
              <div className="progress__bar progress__bar--thin">
                <span style={{ width: `${(done / task.checklist.length) * 100}%` }} />
              </div>
            )}
            <ul className="checklist">
              {task.checklist.map((item) => (
                <li key={item.id} className={item.done ? 'is-done' : ''}>
                  <label>
                    <input type="checkbox" checked={item.done} onChange={() => toggleItem(task.id, item.id)} />
                    <span className="box" aria-hidden="true" />
                    <span className="txt">{item.text}</span>
                  </label>
                  <button className="icon-btn icon-btn--sm" onClick={() => removeItem(task.id, item.id)} aria-label={`${t('removeItem')}: ${item.text}`}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <form className="checklist__add" onSubmit={submitItem}>
              <input value={itemDraft} onChange={(e) => setItemDraft(e.target.value)} placeholder={t('checklistAdd')} aria-label={t('checklistAdd')} />
              <button className="btn btn--ghost btn--sm" disabled={!itemDraft.trim()}>
                {t('add')}
              </button>
            </form>

            <div className="drawer__foot">
              <small>{t('created', { date: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(task.createdAt) })}</small>
              <button
                className="btn btn--danger btn--sm"
                onClick={() => {
                  deleteTask(task.id);
                  onDeleted();
                }}
              >
                {t('deleteTask')}
              </button>
            </div>
          </div>
        )}
      </aside>
      </div>
    </>
  );
}
