import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column as ColumnT, Label, Task } from '../types';
import { useStore } from '../store';
import { useT } from '../i18n';
import { SortableTask } from './TaskCard';

type Props = {
  column: ColumnT;
  tasks: Task[];
  labels: Label[];
  isLast: boolean;
  dragDisabled: boolean;
  composeSignal: number;
  onOpen: (id: string) => void;
};

export default function Column({ column, tasks, labels, isLast, dragDisabled, composeSignal, onOpen }: Props) {
  const t = useT();
  const addTask = useStore((s) => s.addTask);
  const renameColumn = useStore((s) => s.renameColumn);
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: 'column' } });
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // "N" shortcut opens the composer in the first column
  useEffect(() => {
    if (composeSignal) setComposing(true);
  }, [composeSignal]);

  useEffect(() => {
    if (composing) inputRef.current?.focus();
  }, [composing]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const title = draft.trim();
    if (title) addTask(column.id, title);
    setDraft('');
    inputRef.current?.focus();
  };

  const over = column.wip !== undefined && column.taskIds.length > column.wip;

  return (
    <section className={`column${isOver ? ' is-over' : ''}`} aria-labelledby={`col-${column.id}`}>
      <header className="column__head">
        <span className="column__dot" style={{ background: column.color }} />
        {editing ? (
          <input
            className="column__rename"
            defaultValue={column.title}
            autoFocus
            aria-label={t('columnName')}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== column.title) renameColumn(column.id, v);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
        ) : (
          <h2 id={`col-${column.id}`} className="column__title" onDoubleClick={() => setEditing(true)}>
            {column.title}
          </h2>
        )}
        <span className="column__count">{column.taskIds.length}</span>
        {column.wip !== undefined && (
          <span className={`wip${over ? ' wip--over' : ''}`} title={over ? t('wipOver') : undefined}>
            {t('wip', { n: column.wip })}
          </span>
        )}
        <button className="icon-btn column__add" onClick={() => setComposing(true)} aria-label={`${t('addTask')}: ${column.title}`}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <SortableContext id={column.id} items={tasks.map((x) => x.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="column__list">
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} labels={labels} disabled={dragDisabled} done={isLast} onOpen={onOpen} />
          ))}
          {tasks.length === 0 && !composing && <li className="column__empty">{t('empty')}</li>}
        </ul>
      </SortableContext>

      {composing ? (
        <form className="composer" onSubmit={submit}>
          <textarea
            ref={inputRef}
            value={draft}
            rows={2}
            placeholder={t('taskTitle')}
            aria-label={t('taskTitle')}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) submit(e);
              if (e.key === 'Escape') {
                setComposing(false);
                setDraft('');
              }
            }}
          />
          <div className="composer__actions">
            <button type="submit" className="btn btn--primary btn--sm">
              {t('add')}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setComposing(false);
                setDraft('');
              }}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      ) : (
        <button className="column__footer" onClick={() => setComposing(true)}>
          + {t('addTask')}
        </button>
      )}
    </section>
  );
}
