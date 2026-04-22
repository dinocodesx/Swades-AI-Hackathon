CREATE TABLE "transcriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"size" integer NOT NULL,
	"transcript_text" text NOT NULL,
	"transcript_segments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
