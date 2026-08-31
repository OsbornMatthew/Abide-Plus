export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskCategory =
  | 'Spiritual'
  | 'Prayer Target'
  | 'Bible Reading'
  | 'Ministry'
  | 'Tithe & Giving'
  | 'Personal'
  | 'Work'
  | 'Family'
  | 'Health';

export interface SubTask {
  id: string;
  title: string;
  isDone: boolean;
}

export interface TodoTask {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  isDailyRoutine?: boolean;
  subTasks: SubTask[];
  linkedId?: string; // prayer, sermon, or financial reminder
}
