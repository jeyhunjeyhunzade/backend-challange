import { TaskService } from "../services/task-service.js";
import { ValidationError, NotFoundError } from "../domain/errors.js";
import { isValidStatus, TaskStatus } from "../domain/task.js";
import { Command, ParsedArgs } from "./parse-args.js";

export async function route(
  svc: TaskService,
  parsedArgs: ParsedArgs
): Promise<number> {
  const { command, params } = parsedArgs;
  switch (command) {
    case "add": {
      const [description] = params;
      const t = await svc.add(description);
      console.log(`Task added successfully (ID: ${t.id})`);
      return 0;
    }
    case "update": {
      const [id, description] = params;

      const t = await svc.update(id, description);
      console.log(`Task updated successfully (ID: ${t.id})`);
      return 0;
    }
    case "list": {
      const [statusParam] = params;
      let status: TaskStatus | undefined;
      if (statusParam) {
        if (!isValidStatus(statusParam)) {
          console.error("Invalid status. Use: todo | in-progress | done");
          return 2;
        }
        status = statusParam;
      }
      const tasks = await svc.list(status);
      if (!tasks.length) {
        console.log("No tasks found");
        return 0;
      }
      for (const t of tasks) {
        console.log(`[${t.id}] ${t.description} — ${t.status}`);
      }
      return 0;
    }
    case "help":
    case undefined:
      printHelp();
      return 0;
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      return 2;
  }
}

function printHelp() {
  console.log(`Usage:
  task-cli add "<description>"
  task-cli list [todo|in-progress|done]
  task-cli help
`);
}

export function handleError(err: unknown): number {
  if (err instanceof ValidationError) {
    console.error(err.message);
    return 2;
  }

  if (err instanceof NotFoundError) {
    console.error(err.message);
    return 3;
  }

  console.error((err as Error).message);
  return 1;
}
