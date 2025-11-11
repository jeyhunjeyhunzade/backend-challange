import { isValidStatus, Task, TaskStatus } from "../domain/task.js";
import { ValidationError, NotFoundError } from "../domain/errors.js";
import type { TaskRepo } from "../ports/task-repo.js";
import { nowIso } from "../utils/time.js";

export class TaskService {
  constructor(private readonly repo: TaskRepo) {}

  private parseIdOrThrow(id: string | undefined, action: string): number {
    if (!id) {
      throw new ValidationError(`ID is required for ${action}`);
    }
    const n = Number(id);
    if (Number.isNaN(n)) {
      throw new ValidationError("ID must be a number");
    }

    return n;
  }

  private ensureNoDescription(
    description: string | undefined,
    action: string
  ): string {
    if (!description) {
      throw new ValidationError(`Description is required for ${action}`);
    }
    const trimmed = description.trim();
    if (!trimmed) {
      throw new ValidationError("Description cannot be empty");
    }
    return trimmed;
  }

  private async findTaskOrThrow(
    taskId: number,
    originalIdForMsg: string
  ): Promise<{ tasks: Task[]; task: Task }> {
    const tasks = await this.repo.loadAll();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new NotFoundError(`Task with ID ${originalIdForMsg} not found`);
    }
    return { tasks, task };
  }

  async add(description: string): Promise<Task> {
    const tasks = await this.repo.loadAll();
    const newTask: Task = {
      id: this.repo.nextId(tasks),
      description: description.trim(),
      status: "todo",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    tasks.push(newTask);
    await this.repo.saveAll(tasks);
    return newTask;
  }

  async update(id: string, description: string): Promise<Task> {
    const taskId = this.parseIdOrThrow(id, "updating a task");
    const taskDescription = this.ensureNoDescription(
      description,
      "updating a task"
    );

    const { tasks, task } = await this.findTaskOrThrow(taskId, id);

    task.description = taskDescription;
    task.updatedAt = nowIso();
    await this.repo.saveAll(tasks);
    return task;
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const taskId = this.parseIdOrThrow(id, "marking a task");

    const { tasks, task } = await this.findTaskOrThrow(taskId, id);
    task.status = status;
    task.updatedAt = nowIso();
    await this.repo.saveAll(tasks);
    return task;
  }

  async list(status?: TaskStatus): Promise<Task[]> {
    const tasks = await this.repo.loadAll();
    return status ? tasks.filter((t) => t.status === status) : tasks;
  }
}
