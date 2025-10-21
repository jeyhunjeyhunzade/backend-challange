import { isValidStatus, Task, TaskStatus } from "../domain/task.js";
import { ValidationError, NotFoundError } from "../domain/errors.js";
import type { TaskRepo } from "../ports/task-repo.js";
import { nowIso } from "../utils/time.js";

export class TaskService {
  constructor(private readonly repo: TaskRepo) {}

  async add(description: string): Promise<Task> {
    if (!description.trim())
      throw new ValidationError("Description cannot be empty");

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

  async list(status?: TaskStatus): Promise<Task[]> {
    const tasks = await this.repo.loadAll();
    //TODO: if it's not needed, remove it
    if (status && !isValidStatus(status))
      throw new ValidationError("Invalid status");

    return status ? tasks.filter((t) => t.status === status) : tasks;
  }
}
