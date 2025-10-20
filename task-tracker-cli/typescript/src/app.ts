#!/usr/bin/env node
import { parseArgs } from "./cli/parse-args.js";
import { route, handleError } from "./cli/router.js";
import { JsonTaskRepo } from "./adapters/fs/json-task-repo.js";
import { TaskService } from "./services/task-service.js";

async function main(): Promise<number> {
  const parsedArgs = parseArgs(process.argv);
  const repo = new JsonTaskRepo();
  const svc = new TaskService(repo);

  try {
    return await route(svc, parsedArgs);
  } catch (err) {
    return handleError(err);
  }
}

main().then((code) => process.exit(code));
