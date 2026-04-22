import { env } from "@my-better-t-app/env/server";
import { db, transcriptions, type TranscriptSegment } from "@my-better-t-app/db";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Groq } from "groq-sdk";
import fs from "fs";
import path from "path";

const app = new Hono();
const groq = new Groq({ apiKey: env.GROQ_API_KEY });

type GroqTranscriptSegment = {
  start?: number;
  end?: number;
  text?: string;
};

const mapSegments = (segments: GroqTranscriptSegment[] | undefined): TranscriptSegment[] => {
  if (!Array.isArray(segments)) {
    return [];
  }

  return segments.flatMap((segment) => {
    const text = segment.text?.trim();
    if (
      !text ||
      typeof segment.start !== "number" ||
      Number.isNaN(segment.start) ||
      typeof segment.end !== "number" ||
      Number.isNaN(segment.end)
    ) {
      return [];
    }

    return [{ start: segment.start, end: segment.end, text }];
  });
};

// Ensure uploads dir exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(logger());
app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.get("/", (c) => {
  return c.text("OK");
});

app.get("/api/transcriptions", async (c) => {
  try {
    const rows = await db
      .select({
        id: transcriptions.id,
        title: transcriptions.title,
        size: transcriptions.size,
        transcriptText: transcriptions.transcriptText,
        transcriptSegments: transcriptions.transcriptSegments,
        createdAt: transcriptions.createdAt,
      })
      .from(transcriptions)
      .orderBy(transcriptions.createdAt)
      .limit(10);

    return c.json({ success: true, transcriptions: rows.reverse() });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error fetching transcriptions";
    return c.json({ error: errorMessage }, 500);
  }
});

app.post("/api/transcribe", async (c) => {
  const body = await c.req.parseBody();
  const audioFile = body["audio"];

  if (!audioFile || !(audioFile instanceof File)) {
    return c.json({ error: "Please upload an audio file" }, 400);
  }

  const fileId = Date.now().toString();
  const tempDir = path.join(uploadsDir, fileId);
  fs.mkdirSync(tempDir, { recursive: true });

  const inputPath = path.join(tempDir, `input_${audioFile.name}`);

  try {
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(inputPath, buffer);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(inputPath),
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      language: "en",
      temperature: 0.0,
    });

    const transcriptText = transcription.text.trim();
    const transcriptSegments = mapSegments(
      "segments" in transcription
        ? (transcription.segments as GroqTranscriptSegment[] | undefined)
        : undefined,
    );

    await db.insert(transcriptions).values({
      title: audioFile.name,
      size: audioFile.size,
      transcriptText,
      transcriptSegments,
    });

    return c.json({ success: true, text: transcriptText, segments: transcriptSegments });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error processing audio";
    return c.json({ error: errorMessage }, 500);
  } finally {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (e) {
      // Ignore cleanup errors silently
    }
  }
});

export default {
  port: 8000,
  fetch: app.fetch,
};
