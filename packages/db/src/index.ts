import { env } from "@my-better-t-app/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";
export { transcriptions, type TranscriptSegment } from "./schema";

export function createDb() {
  return drizzle(env.DATABASE_URL, { schema });
}

export const db = createDb();
