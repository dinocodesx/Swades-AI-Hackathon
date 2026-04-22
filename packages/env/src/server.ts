import { config } from "dotenv";
import path from "path";
import fs from "fs";

// Find .env file by traversing up from current directory
let currentDir = process.cwd();
let envPath = path.join(currentDir, ".env");

while (!fs.existsSync(envPath) && currentDir !== path.parse(currentDir).root) {
  currentDir = path.dirname(currentDir);
  envPath = path.join(currentDir, ".env");
}

if (fs.existsSync(envPath)) {
  config({ path: envPath });
} else {
  config(); // Fallback to default behavior
}

import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    GROQ_API_KEY: z.string().min(1),
    PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
