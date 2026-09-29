import { memo, type CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Label, Task } from '../types';
import { useLocale, useT } from '../i18n';
import { dueState, formatDue } from '../lib/dates';

type CardProps = { task: Task; labels: Label[]; overlay?: boolean; done?: boolean };

const priorityIcon: Record<Task['priority'], string> = {
  low: 'M4 16h4v4H4z',
  medium: 'M4 16h4v4H4zm6-5h4v9h-4z',
  high: 'M4 16h4v4H4zm6-5h4v9h-4zm6-5h4v14h-4z',
  urgent: 'M12 2 1 21h22L12 2Zm-1 7h2v6h-2V9Zm0 8h2v2h-2v-2Z',
};

export const TaskCardBody = memo(function TaskCardBody({ task, labels, overlay, done }: CardProps) {
  const t = useT();
  const locale = useLocale();
  const total = task.checklist.length;
  const checked = task.checklist.filter((i) => i.done).length;
  const due = task.due ? dueState(task.due) : null;
  const dueText = task.due ? (due === 'today' ? t('today') : due === 'tomorrow' ? t('tomorrow') : formatDue(task.due, locale)) : '';

  return (
    <div className={`card${overlay ? ' card--overlay' : ''}${done ? ' card--done' : ''}`}>
      {task.labels.length > 0 && (
        <div className="card__labels">
          {task.labels.map((id) => {
            const l = labels.find((x) => x.id === id);
            return l ? (
              <span key={id} className="tag" style={{ '--c': l.color } as CSSProperties}>
                {l.name}
              </span>
            ) : null;
          })}
        </div>
      )}
      <p className="card__title">{task.title}</p>
      <div className="card__meta">
        <span className={`prio prio--${task.priority}`} title={t(`p.${task.priority}`)}>
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path d={priorityIcon[task.priority]} fill="currentColor" />
          </svg>
          <span className="sr-only">{t(`p.${task.priority}`)}</span>
        </span>
        {task.due && (
          <span className={`due due--${done ? 'done' : due}`} title={due === 'overdue' && !done ? t('overdue') : undefined}>
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" />
            </svg>
            {dueText}
          </span>
        )}
        {total > 0 && (
          <span className={`check${checked === total ? ' check--full' : ''}`}>
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
              <path d="m5 12 4 4 10-10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {checked}/{total}
          </span>
        )}
        {task.description && (
          <span className="has-desc" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="13" height="13">
              <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        )}
        {task.assignees.length > 0 && (
          <span className="avatars">
            {task.assignees.map((a) => (
              <i key={a} style={{ '--h': [...a].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 360 } as CSSProperties}>
                {a}
              </i>
            ))}
          </span>
        )}
      </div>
    </div>
  );
});

type SortableProps = { task: Task; labels: Label[]; disabled: boolean; done: boolean; onOpen: (id: string) => void };

export function SortableTask({ task, labels, disabled, done, onOpen }: SortableProps) {
  const t = useT();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, disabled, data: { type: 'task' } });

  return (
    <li
      ref={setNodeRef}
      className={`task${isDragging ? ' is-dragging' : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={t('open', { title: task.title })}
      onClick={() => onOpen(task.id)}
      onKeyDown={(e) => {
        // Enter opens, space is reserved for dnd-kit keyboard dragging
        if (e.key === 'Enter' && !isDragging) onOpen(task.id);
        else listeners?.onKeyDown?.(e);
      }}
    >
      <TaskCardBody task={task} labels={labels} done={done} />
    </li>
  );
}
