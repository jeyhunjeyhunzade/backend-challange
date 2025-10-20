import { Task, TaskStatus } from "../domain/task";

export interface TaskRepo {
  loadAll(): Promise<Task[]>;
  saveAll(tasks: Task[]): Promise<void>;

  // helpers are optional; service can operate on arrays
  nextId(current: Task[]): number;
}
