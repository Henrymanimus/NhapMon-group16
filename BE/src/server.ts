import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { testDbConnection } from "./db/pool";

async function bootstrap(): Promise<void> {
  await testDbConnection();
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Backend server started");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "Failed to start backend");
  process.exit(1);
});
