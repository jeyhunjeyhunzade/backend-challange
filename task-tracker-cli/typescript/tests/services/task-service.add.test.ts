import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { TaskService } from "../../src/services/task-service.js";
import { ValidationError } from "../../src/domain/errors.js";
import { MockTaskRepo } from "../mocks/mock-task-repo.js";
import { Task } from "../../src/domain/task.js";

describe("TaskService.add()", () => {
  let taskService: TaskService;
  let mockRepo: MockTaskRepo;

  beforeEach(() => {
    mockRepo = new MockTaskRepo();
    taskService = new TaskService(mockRepo);
  });

  describe("successful task creation", () => {
    it("should create a task with valid description", async () => {
      const description = "Buy groceries";

      const result = await taskService.add(description);

      assert.strictEqual(result.description, description);
      assert.strictEqual(result.id, 1);
      assert.strictEqual(result.status, "todo");
      assert(result.createdAt);
      assert(result.updatedAt);
      assert(result.createdAt === result.updatedAt);
    });

    it("should trim whitespace from description", async () => {
      const description = "  Buy groceries  ";

      const result = await taskService.add(description);

      assert.strictEqual(result.description, "Buy groceries");
    });

    it("should assign incremental IDs to multiple tasks", async () => {
      const task1 = await taskService.add("First task");
      const task2 = await taskService.add("Second task");
      const task3 = await taskService.add("Third task");

      assert.strictEqual(task1.id, 1);
      assert.strictEqual(task2.id, 2);
      assert.strictEqual(task3.id, 3);
    });

    it("should assign correct ID when existing tasks are present", async () => {
      const existingTasks: Task[] = [
        {
          id: 5,
          description: "Existing task",
          status: "todo",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
        {
          id: 10,
          description: "Another task",
          status: "done",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
      ];
      mockRepo.setTasks(existingTasks);

      const result = await taskService.add("New task");

      assert.strictEqual(result.id, 11); // Should be max existing ID + 1
    });

    it("should save the task to repository", async () => {
      await taskService.add("Test task");

      const savedTasks = mockRepo.getTasks();
      assert.strictEqual(savedTasks.length, 1);
      assert.strictEqual(savedTasks[0].description, "Test task");
    });

    it("should preserve existing tasks when adding new ones", async () => {
      const existingTask: Task = {
        id: 1,
        description: "Existing task",
        status: "todo",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      };
      mockRepo.setTasks([existingTask]);

      await taskService.add("New task");

      const savedTasks = mockRepo.getTasks();
      assert.strictEqual(savedTasks.length, 2);
      assert.strictEqual(savedTasks[0].description, "Existing task");
      assert.strictEqual(savedTasks[1].description, "New task");
    });
  });

  describe("validation errors", () => {
    it("should throw ValidationError for empty description", async () => {
      await assert.rejects(
        () => taskService.add(""),
        (err: ValidationError) => {
          assert(err instanceof ValidationError);
          assert.strictEqual(err.message, "Description cannot be empty");
          return true;
        }
      );
    });

    it("should throw ValidationError for whitespace-only description", async () => {
      await assert.rejects(
        () => taskService.add("   "),
        (err: ValidationError) => {
          assert(err instanceof ValidationError);
          assert.strictEqual(err.message, "Description cannot be empty");
          return true;
        }
      );
    });

    it("should throw ValidationError for tab-only description", async () => {
      await assert.rejects(
        () => taskService.add("\t\t"),
        (err: ValidationError) => {
          assert(err instanceof ValidationError);
          assert.strictEqual(err.message, "Description cannot be empty");
          return true;
        }
      );
    });

    it("should throw ValidationError for newline-only description", async () => {
      await assert.rejects(
        () => taskService.add("\n\r\n"),
        (err: ValidationError) => {
          assert(err instanceof ValidationError);
          assert.strictEqual(err.message, "Description cannot be empty");
          return true;
        }
      );
    });
  });

  describe("repository error handling", () => {
    it("should propagate repository load errors", async () => {
      mockRepo.simulateLoadFailure();

      await assert.rejects(
        () => taskService.add("Test task"),
        (err: Error) => {
          assert.strictEqual(err.message, "Mock load failure");
          return true;
        }
      );
    });

    it("should propagate repository save errors", async () => {
      mockRepo.simulateSaveFailure();

      await assert.rejects(
        () => taskService.add("Test task"),
        (err: Error) => {
          assert.strictEqual(err.message, "Mock save failure");
          return true;
        }
      );
    });
  });

  describe("edge cases", () => {
    it("should handle very long descriptions", async () => {
      const longDescription = "a".repeat(1000);

      const result = await taskService.add(longDescription);

      assert.strictEqual(result.description, longDescription);
      assert.strictEqual(result.description.length, 1000);
    });

    it("should handle descriptions with special characters", async () => {
      const specialDescription = "Task with émojis 🚀 and symbols: @#$%^&*()";

      const result = await taskService.add(specialDescription);

      assert.strictEqual(result.description, specialDescription);
    });

    it("should handle descriptions with newlines", async () => {
      const multilineDescription = "Task with\nnewlines\nand\ttabs";

      const result = await taskService.add(multilineDescription);

      assert.strictEqual(result.description, multilineDescription);
    });

    it("should assign ID 1 when no existing tasks", async () => {
      mockRepo.setTasks([]);

      const result = await taskService.add("First task");

      assert.strictEqual(result.id, 1);
    });
  });

  describe("timestamp validation", () => {
    it("should create valid ISO timestamps", async () => {
      const result = await taskService.add("Test task");

      // Validate that timestamps are valid ISO strings
      const createdDate = new Date(result.createdAt);
      const updatedDate = new Date(result.updatedAt);

      assert(!isNaN(createdDate.getTime()));
      assert(!isNaN(updatedDate.getTime()));
      assert.strictEqual(result.createdAt, createdDate.toISOString());
      assert.strictEqual(result.updatedAt, updatedDate.toISOString());
    });

    it("should create timestamps close to current time", async () => {
      const beforeAdd = new Date();
      const result = await taskService.add("Test task");
      const afterAdd = new Date();

      const taskCreatedTime = new Date(result.createdAt);

      // Timestamps should be within a reasonable range (1 second) of the test execution
      assert(taskCreatedTime >= beforeAdd);
      assert(taskCreatedTime <= afterAdd);
    });
  });
});
