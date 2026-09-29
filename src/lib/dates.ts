export type DueState = 'overdue' | 'today' | 'tomorrow' | 'soon' | 'later';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function dueState(due: string): DueState {
  const [y, m, d] = due.split('-').map(Number);
  const diff = Math.round((startOfDay(new Date(y, m - 1, d)) - startOfDay(new Date())) / 86400000);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  return diff <= 7 ? 'soon' : 'later';
}

export function formatDue(due: string, locale: string) {
  const [y, m, d] = due.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(y, m - 1, d));
}
