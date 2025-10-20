import path from "path";
import process from "process";

/**
 * Requirement says: JSON file in the current directory.
 * We resolve to CWD to respect that constraint.
 */
export function tasksFilePath(): string {
  return path.resolve(process.cwd(), "tasks.json");
}
