import { buildServer } from "./infra/http/server";
import { env } from "./config/env";

async function main() {
  const app = buildServer();
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  for (const sig of signals) {
    process.on(sig, async () => {
      app.log.info({ sig }, "graceful shutdown start");
      try {
        await app.close();
        process.exit(0);
      } catch (err) {
        app.log.error(err, "graceful shutdown error");
        process.exit(1);
      }
    });
  }

  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  app.log.info({ port: env.PORT }, "server started");
}

main().catch((err) => {
  console.error(err);
  process.exit(0);
});
