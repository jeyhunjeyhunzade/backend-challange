import { isValidStatus, Task, TaskStatus } from "../domain/task.js";
import { ValidationError, NotFoundError } from "../domain/errors.js";
import type { TaskRepo } from "../ports/task-repo.js";
import { nowIso } from "../utils/time.js";

export class TaskService {
  constructor(private readonly repo: TaskRepo) {}

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
    if (!id) {
      throw new ValidationError("ID is required for updating a task");
    }

    let taskId = Number(id);
    if (isNaN(taskId)) {
      throw new ValidationError("ID must be a number");
    }

    if (!description) {
      throw new ValidationError("Description is required for updating a task");
    }

    if (!description.trim()) {
      throw new ValidationError("Description cannot be empty");
    }

    const tasks = await this.repo.loadAll();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    task.description = description.trim();
    task.updatedAt = nowIso();
    console.log("Tasks is updated!: ", tasks);
    await this.repo.saveAll(tasks);
    return task;
  }

  async list(status?: TaskStatus): Promise<Task[]> {
    const tasks = await this.repo.loadAll();
    return status ? tasks.filter((t) => t.status === status) : tasks;
  }
}
