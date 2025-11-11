import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { TaskService } from "../../src/services/task-service.js";
import { MockTaskRepo } from "../mocks/mock-task-repo.js";
import { Task } from "../../src/domain/task.js";
import { NotFoundError, ValidationError } from "../../src/domain/errors.js";

describe("TaskService.add", () => {
  it("creates a new task with trimmed description, and default fields", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    const task = await svc.add("  New Task  ");
    assert.equal(task.description, "New Task");
    assert.equal(task.status, "todo");
    assert.ok(task.id);
    assert.ok(task.createdAt);
    assert.ok(task.updatedAt);
  });
});

describe("TaskService.update", () => {
  it("updates an existing task's description and updatedAt timestamp", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    const created = await svc.add("Initial Task");

    // The issue is that created and updated are the same object reference!
    // When you modify task.updatedAt in the service, you're modifying the same object that created points to.
    const originalUpdatedAt = created.updatedAt;

    await new Promise((r) => setTimeout(r, 10)); // Ensure timestamp difference
    const updated = await svc.update(String(created.id), "  Updated Task  ");

    assert.equal(updated.id, created.id);
    assert.equal(updated.description, "Updated Task");
    assert.equal(updated.status, created.status);
    assert.equal(updated.createdAt, created.createdAt);
    assert.notEqual(updated.updatedAt, originalUpdatedAt);
  });

  it("throws ValidationError if ID is missing", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    await assert.rejects(
      () => svc.update("", "Some Description"),
      ValidationError
    );
  });

  it("throws ValidationError if description is empty", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    const created = await svc.add("Initial Task");

    await assert.rejects(
      () => svc.update(String(created.id), "   "),
      ValidationError
    );
  });

  it("throws NotFoundError if task does not exist", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    await assert.rejects(
      () => svc.update("999", "Some Description"),
      /not found/
    );
  });
});

describe("TaskService.updateStatus", () => {
  it("updates an existing task's status and updatedAt timestamp", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    const created = await svc.add("Initial Task");
    const originalUpdatedAt = created.updatedAt;

    await new Promise((r) => setTimeout(r, 10)); // Ensure timestamp difference
    const updated = await svc.updateStatus(String(created.id), "done");

    assert.equal(updated.id, created.id);
    assert.equal(updated.description, created.description);
    assert.equal(updated.status, "done");
    assert.equal(updated.createdAt, created.createdAt);
    assert.notEqual(updated.updatedAt, originalUpdatedAt);
  });

  it("throws ValidationError if ID is missing", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    await assert.rejects(() => svc.updateStatus("", "done"), ValidationError);
  });

  it("throws NotFoundError if task does not exist", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    await assert.rejects(() => svc.updateStatus("999", "done"), /not found/);
  });
});

describe("TaskService.delete", () => {
  it("deletes task from repository", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    const created = await svc.add("Task to delete");
    await svc.delete(String(created.id));

    const tasks = await svc.list();
    assert.equal(tasks.length, 0);
  });

  it("throws ValidationError when ID is missing", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    await assert.rejects(() => svc.delete(""), ValidationError);
  });

  it("throws NotFoundError when task does not exist", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    await assert.rejects(() => svc.delete("999"), NotFoundError);
  });
});

describe("TaskService.list", () => {
  it("returns all tasks when no status filter is provided", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    await svc.add("Task 1");
    await svc.add("Task 2");

    const tasks = await svc.list();
    assert.equal(tasks.length, 2);
  });

  it("returns only tasks with specified status", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    const task1 = await svc.add("Task 1");
    const task2 = await svc.add("Task 2");
    await svc.updateStatus(String(task2.id), "done");

    const todoTasks = await svc.list("todo");
    const doneTasks = await svc.list("done");

    assert.equal(todoTasks.length, 1);
    assert.equal(doneTasks.length, 1);
    assert.equal(todoTasks[0].id, task1.id);
    assert.equal(doneTasks[0].id, task2.id);
  });

  it("returns empty array when no tasks match filter", async () => {
    const repo = new MockTaskRepo();
    const svc = new TaskService(repo);

    await svc.add("Task 1");

    const inProgressTasks = await svc.list("in-progress");
    assert.equal(inProgressTasks.length, 0);
  });
});
