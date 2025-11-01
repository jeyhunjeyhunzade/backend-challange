import { describe, it, expect } from "vitest";
import { buildServer } from "../src/infra/http/server";

describe("Health endpoint", () => {
  it("returns ok with request_id", async () => {
    const app = buildServer();
    const res = await app.inject({
      method: "GET",
      url: "/healthz/",
    });
    const body = res.json();
    expect(body.status).toBe("ok");
    expect(body.request_id).toBeTruthy();
    await app.close();
  });
});
