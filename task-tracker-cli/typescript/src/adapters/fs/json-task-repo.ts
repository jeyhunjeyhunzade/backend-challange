import fs from "fs/promises";
import { Task } from "../../domain/task.js";
import { StorageError } from "../../domain/errors.js";
import { tasksFilePath } from "../../infra/paths.js";
import type { TaskRepo } from "../../ports/task-repo.js";

export class JsonTaskRepo implements TaskRepo {
  private file = tasksFilePath();

  async loadAll(): Promise<Task[]> {
    try {
      const data = await fs.readFile(this.file, "utf-8").catch(async (e) => {
        if ("code" in e && e.code === "ENOENT") {
          // File doesn’t exist yet → initialize empty array.
          await fs.writeFile(this.file, "[]", "utf-8");
          return "[]";
        }
        throw e;
      });
      const tasks = JSON.parse(data) as Task[];
      return Array.isArray(tasks) ? tasks : [];
    } catch (err) {
      throw new StorageError(
        `Failed to read tasks: ${(err as Error).message}`,
        err
      );
    }
  }

  async saveAll(tasks: Task[]): Promise<void> {
    try {
      // Safer write (two-phase): write temp, then rename
      const tempFile = `${this.file}.tmp`;
      await fs.writeFile(tempFile, JSON.stringify(tasks, null, 2), "utf-8");
      await fs.rename(tempFile, this.file);
    } catch (err) {
      throw new StorageError(
        `Failed to write tasks: ${(err as Error).message}`,
        err
      );
    }
  }

  nextId(current: Task[]): number {
    return current?.length ? Math.max(...current.map((t) => t.id)) + 1 : 1;
  }
}
