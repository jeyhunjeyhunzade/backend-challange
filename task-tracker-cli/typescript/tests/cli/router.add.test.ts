import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { route } from "../../src/cli/router.js";
import { TaskService } from "../../src/services/task-service.js";
import { ValidationError } from "../../src/domain/errors.js";
import { MockTaskRepo } from "../mocks/mock-task-repo.js";
import { ParsedArgs } from "../../src/cli/parse-args.js";

// Mock console.log to capture output
let mockConsoleLog: string[] = [];
let originalConsoleLog: typeof console.log;

describe("Router - add command", () => {
  let taskService: TaskService;
  let mockRepo: MockTaskRepo;

  beforeEach(() => {
    mockRepo = new MockTaskRepo();
    taskService = new TaskService(mockRepo);

    // Mock console.log to capture output
    originalConsoleLog = console.log;
    mockConsoleLog = [];
    console.log = (...args: any[]) => {
      mockConsoleLog.push(args.join(" "));
    };
  });

  afterEach(() => {
    // Restore original console.log
    console.log = originalConsoleLog;
  });

  describe("successful add command", () => {
    it("should add task and return exit code 0", async () => {
      const parsedArgs: ParsedArgs = {
        command: "add",
        params: ["Buy groceries"],
      };

      const exitCode = await route(taskService, parsedArgs);

      assert.strictEqual(exitCode, 0);
      assert.strictEqual(mockConsoleLog.length, 1);
      assert(mockConsoleLog[0].includes("Task added successfully"));
      assert(mockConsoleLog[0].includes("ID: 1"));
    });

    it("should add task with trimmed description", async () => {
      const parsedArgs: ParsedArgs = {
        command: "add",
        params: ["  Buy groceries  "],
      };

      const exitCode = await route(taskService, parsedArgs);

      assert.strictEqual(exitCode, 0);

      // Verify the task was actually saved with trimmed description
      const savedTasks = mockRepo.getTasks();
      assert.strictEqual(savedTasks.length, 1);
      assert.strictEqual(savedTasks[0].description, "Buy groceries");
    });

    it("should display correct task ID for multiple adds", async () => {
      // Add first task
      await route(taskService, {
        command: "add",
        params: ["First task"],
      });

      // Clear mock log and add second task
      mockConsoleLog = [];
      const exitCode = await route(taskService, {
        command: "add",
        params: ["Second task"],
      });

      assert.strictEqual(exitCode, 0);
      assert(mockConsoleLog[0].includes("ID: 2"));
    });

    it("should add task when existing tasks are present", async () => {
      // Pre-populate with existing tasks
      await route(taskService, { command: "add", params: ["Existing task"] });

      // Clear mock log and add new task
      mockConsoleLog = [];
      const exitCode = await route(taskService, {
        command: "add",
        params: ["New task"],
      });

      assert.strictEqual(exitCode, 0);
      assert(mockConsoleLog[0].includes("ID: 2"));

      // Verify both tasks exist
      const savedTasks = mockRepo.getTasks();
      assert.strictEqual(savedTasks.length, 2);
    });
  });

  describe("error handling", () => {
    it("should handle ValidationError from TaskService", async () => {
      const parsedArgs: ParsedArgs = {
        command: "add",
        params: [""],
      };

      await assert.rejects(
        () => route(taskService, parsedArgs),
        (err: ValidationError) => {
          assert(err instanceof ValidationError);
          assert.strictEqual(err.message, "Description cannot be empty");
          return true;
        }
      );
    });

    it("should handle whitespace-only description", async () => {
      const parsedArgs: ParsedArgs = {
        command: "add",
        params: ["   "], // Whitespace-only description
      };

      await assert.rejects(
        () => route(taskService, parsedArgs),
        (err: ValidationError) => {
          assert(err instanceof ValidationError);
          assert.strictEqual(err.message, "Description cannot be empty");
          return true;
        }
      );
    });

    it("should propagate repository errors", async () => {
      mockRepo.simulateLoadFailure();

      const parsedArgs: ParsedArgs = {
        command: "add",
        params: ["Test task"],
      };

      await assert.rejects(
        () => route(taskService, parsedArgs),
        (err: Error) => {
          assert.strictEqual(err.message, "Mock load failure");
          return true;
        }
      );
    });

    it("should handle save failures", async () => {
      mockRepo.simulateSaveFailure();

      const parsedArgs: ParsedArgs = {
        command: "add",
        params: ["Test task"],
      };

      await assert.rejects(
        () => route(taskService, parsedArgs),
        (err: Error) => {
          assert.strictEqual(err.message, "Mock save failure");
          return true;
        }
      );
    });
  });

  describe("edge cases", () => {
    it("should handle undefined description parameter", async () => {
      const parsedArgs = {
        command: "add" as const,
        params: [] as any,
      };

      // This should result in undefined description, which gets converted to empty string
      await assert.rejects(
        () => route(taskService, parsedArgs),
        (err: ValidationError) => {
          assert(err instanceof ValidationError);
          return true;
        }
      );
    });

    it("should handle very long descriptions", async () => {
      const longDescription = "a".repeat(1000);
      const parsedArgs: ParsedArgs = {
        command: "add",
        params: [longDescription],
      };

      const exitCode = await route(taskService, parsedArgs);

      assert.strictEqual(exitCode, 0);
      assert(mockConsoleLog[0].includes("Task added successfully"));

      const savedTasks = mockRepo.getTasks();
      assert.strictEqual(savedTasks[0].description, longDescription);
    });

    it("should handle descriptions with special characters", async () => {
      const specialDescription = "Task with émojis 🚀 and symbols: @#$%^&*()";
      const parsedArgs: ParsedArgs = {
        command: "add",
        params: [specialDescription],
      };

      const exitCode = await route(taskService, parsedArgs);

      assert.strictEqual(exitCode, 0);

      const savedTasks = mockRepo.getTasks();
      assert.strictEqual(savedTasks[0].description, specialDescription);
    });

    it("should handle descriptions with quotes", async () => {
      const quotedDescription =
        "Task with \"double quotes\" and 'single quotes'";
      const parsedArgs: ParsedArgs = {
        command: "add",
        params: [quotedDescription],
      };

      const exitCode = await route(taskService, parsedArgs);

      assert.strictEqual(exitCode, 0);

      const savedTasks = mockRepo.getTasks();
      assert.strictEqual(savedTasks[0].description, quotedDescription);
    });
  });

  describe("console output validation", () => {
    it("should log success message with correct format", async () => {
      const parsedArgs: ParsedArgs = {
        command: "add",
        params: ["Test task"],
      };

      await route(taskService, parsedArgs);

      assert.strictEqual(mockConsoleLog.length, 1);
      assert(mockConsoleLog[0].startsWith("Task added successfully"));
      assert(mockConsoleLog[0].includes("(ID: 1)"));
      assert(mockConsoleLog[0].endsWith(")"));
    });

    it("should not log anything on error", async () => {
      const parsedArgs: ParsedArgs = {
        command: "add",
        params: [""], // This will cause a ValidationError
      };

      try {
        await route(taskService, parsedArgs);
      } catch {
        // Expected to throw
      }

      // No console.log should be called on error
      assert.strictEqual(mockConsoleLog.length, 0);
    });
  });

  describe("integration with TaskService", () => {
    it("should properly integrate with TaskService.add method", async () => {
      const description = "Integration test task";
      const parsedArgs: ParsedArgs = {
        command: "add",
        params: [description],
      };

      const exitCode = await route(taskService, parsedArgs);

      assert.strictEqual(exitCode, 0);

      // Verify the task was properly created via TaskService
      const savedTasks = mockRepo.getTasks();
      assert.strictEqual(savedTasks.length, 1);
      assert.strictEqual(savedTasks[0].description, description);
      assert.strictEqual(savedTasks[0].status, "todo");
      assert.strictEqual(savedTasks[0].id, 1);
      assert(savedTasks[0].createdAt);
      assert(savedTasks[0].updatedAt);
    });
  });
});
