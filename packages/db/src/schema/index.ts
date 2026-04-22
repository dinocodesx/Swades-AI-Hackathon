import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

export const transcriptions = pgTable("transcriptions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  size: integer("size").notNull(),
  transcriptText: text("transcript_text").notNull(),
  transcriptSegments: jsonb("transcript_segments")
    .$type<TranscriptSegment[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
