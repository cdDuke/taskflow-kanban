export type Lang = 'ru' | 'en';
export type Theme = 'dark' | 'light';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Label = { id: string; name: string; color: string };
export type ChecklistItem = { id: string; text: string; done: boolean };

export type Task = {
  id: string;
  title: string;
  description: string;
  labels: string[];
  priority: Priority;
  due?: string; // YYYY-MM-DD
  checklist: ChecklistItem[];
  assignees: string[];
  createdAt: number;
};

export type Column = { id: string; title: string; color: string; taskIds: string[]; wip?: number };

export type Board = {
  id: string;
  name: string;
  emoji: string;
  columns: Column[];
  tasks: Record<string, Task>;
  labels: Label[];
};

export const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];
