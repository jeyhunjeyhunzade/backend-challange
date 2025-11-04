import { TaskStatus } from "../domain/task";

export type Command =
  | "add"
  | "update"
  | "delete"
  | "list"
  | "mark-done"
  | "mark-in-progress"
  | "help"
  | undefined;

export type ParsedArgs =
  | { command: "add"; params: [string] }
  | { command: "update"; params: [string, string] }
  | { command: "delete"; params: [string] }
  | { command: "list"; params: [TaskStatus?] }
  | { command: "mark-done" | "mark-in-progress"; params: [string] }
  | { command: "help"; params: string[] };

export function parseArgs(argv: string[]): ParsedArgs {
  const [, , ...rest] = argv;
  const [command, ...params] = rest;
  return { command: command as Command, params } as ParsedArgs;
}
