import { Task } from "../../src/domain/task.js";
import { TaskRepo } from "../../src/ports/task-repo.js";

export class MockTaskRepo implements TaskRepo {
  private tasks: Task[] = [];
  private shouldFailLoad = false;
  private shouldFailSave = false;

  constructor(initialTasks: Task[] = []) {
    this.tasks = initialTasks;
  }

  async loadAll(): Promise<Task[]> {
    if (this.shouldFailLoad) {
      throw new Error("Mock load failure");
    }
    return this.tasks;
  }

  async saveAll(tasks: Task[]): Promise<void> {
    if (this.shouldFailSave) {
      throw new Error("Mock save failure");
    }
    this.tasks = tasks;
  }

  nextId(current: Task[]): number {
    return current?.length ? Math.max(...current.map((t) => t.id)) + 1 : 1;
  }

  // Test helper methods
  getTasks(): Task[] {
    return this.tasks;
  }

  setTasks(tasks: Task[]): void {
    this.tasks = tasks;
  }

  simulateLoadFailure(): void {
    this.shouldFailLoad = true;
  }

  simulateSaveFailure(): void {
    this.shouldFailSave = true;
  }

  reset(): void {
    this.tasks = [];
    this.shouldFailLoad = false;
    this.shouldFailSave = false;
  }
}
