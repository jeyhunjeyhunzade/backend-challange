export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: number;
  description: string;
  status: TaskStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export function isValidStatus(s: string): s is TaskStatus {
  return s === "todo" || s === "in-progress" || s === "done";
}
