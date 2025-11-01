import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import { env } from "../../config/env";
import { requestIdHook } from "../observability/requestId";
import healthRoutes from "./routes/health";

export function buildServer() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
    },
  });

  app.addHook("onRequest", requestIdHook);
  app.register(helmet);
  app.register(cors, { origin: true, credentials: true });

  app.register(healthRoutes, { prefix: "/healthz" });

  return app;
}
