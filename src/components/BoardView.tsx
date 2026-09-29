import { useMemo, useState, type FormEvent } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useActiveBoard, useStore } from '../store';
import { useT } from '../i18n';
import type { Priority } from '../types';
import Column from './Column';
import { TaskCardBody } from './TaskCard';

type Props = {
  query: string;
  priority: Priority | 'all';
  composeSignal: number;
  onOpen: (id: string) => void;
};

export default function BoardView({ query, priority, composeSignal, onOpen }: Props) {
  const t = useT();
  const board = useActiveBoard();
  const moveTask = useStore((s) => s.moveTask);
  const snapshot = useStore((s) => s.snapshot);
  const addColumn = useStore((s) => s.addColumn);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [colDraft, setColDraft] = useState<string | null>(null);

  const filtering = query.trim() !== '' || priority !== 'all';
  const q = query.trim().toLowerCase();

  const visible = useMemo(() => {
    const map: Record<string, string[]> = {};
    board.columns.forEach((c) => {
      map[c.id] = c.taskIds.filter((id) => {
        const task = board.tasks[id];
        if (!task) return false;
        if (priority !== 'all' && task.priority !== priority) return false;
        if (!q) return true;
        const labelNames = task.labels.map((l) => board.labels.find((x) => x.id === l)?.name ?? '').join(' ');
        return `${task.title} ${task.description} ${labelNames}`.toLowerCase().includes(q);
      });
    });
    return map;
  }, [board, q, priority]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Enter'] } })
  );

  const columnOf = (id: UniqueIdentifier) =>
    board.columns.find((c) => c.id === id) ?? board.columns.find((c) => c.taskIds.includes(String(id)));

  const title = (id: UniqueIdentifier) => board.tasks[String(id)]?.title ?? '';
  const announcements: Announcements = {
    onDragStart: ({ active }) => t('a11y.start', { title: title(active.id) }),
    onDragOver: ({ active, over }) => (over ? t('a11y.over', { title: title(active.id), col: columnOf(over.id)?.title ?? '' }) : undefined),
    onDragEnd: ({ active, over }) => (over ? t('a11y.end', { title: title(active.id), col: columnOf(over.id)?.title ?? '' }) : undefined),
    onDragCancel: ({ active }) => t('a11y.cancel', { title: title(active.id) }),
  };

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    snapshot(); // one undo step for the whole drag
  };

  // Moving across columns happens live while hovering
  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const from = columnOf(active.id);
    const to = columnOf(over.id);
    if (!from || !to || from.id === to.id) return;
    const overIndex = to.taskIds.indexOf(String(over.id));
    moveTask(String(active.id), to.id, overIndex === -1 ? to.taskIds.length : overIndex);
  };

  // Reordering inside a column is committed on drop
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    const col = columnOf(over.id);
    if (!col) return;
    const from = col.taskIds.indexOf(String(active.id));
    const to = col.taskIds.indexOf(String(over.id));
    if (from !== -1 && to !== -1 && from !== to) moveTask(String(active.id), col.id, to);
  };

  const submitColumn = (e: FormEvent) => {
    e.preventDefault();
    const v = colDraft?.trim();
    if (v) addColumn(v);
    setColDraft(null);
  };

  const active = activeId ? board.tasks[activeId] : null;
  const nothing = filtering && Object.values(visible).every((ids) => ids.length === 0);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{ announcements, screenReaderInstructions: { draggable: t('a11y.instructions') } }}
    >
      {filtering && <p className="filter-note">{nothing ? t('noResults') : t('filtersOn')}</p>}
      <div className="board">
        {board.columns.map((col, i) => (
          <Column
            key={col.id}
            column={col}
            tasks={visible[col.id].map((id) => board.tasks[id])}
            labels={board.labels}
            isLast={i === board.columns.length - 1}
            dragDisabled={filtering}
            composeSignal={i === 0 ? composeSignal : 0}
            onOpen={onOpen}
          />
        ))}

        {colDraft === null ? (
          <button className="add-column" onClick={() => setColDraft('')}>
            + {t('addColumn')}
          </button>
        ) : (
          <form className="add-column add-column--form" onSubmit={submitColumn}>
            <input
              autoFocus
              value={colDraft}
              placeholder={t('columnName')}
              aria-label={t('columnName')}
              onChange={(e) => setColDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setColDraft(null)}
            />
            <div className="composer__actions">
              <button className="btn btn--primary btn--sm">{t('add')}</button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setColDraft(null)}>
                {t('cancel')}
              </button>
            </div>
          </form>
        )}
      </div>

      <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
        {active ? <TaskCardBody task={active} labels={board.labels} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
