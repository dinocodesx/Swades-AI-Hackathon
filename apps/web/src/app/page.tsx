"use client";

import { useEffect, useRef, useState } from "react";
import { env } from "@my-better-t-app/env/web";

type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

type RecentTranscription = {
  id: number;
  title: string;
  size: number;
  transcriptText: string;
  transcriptSegments: TranscriptSegment[];
  createdAt: string;
};

type ApiErrorResponse = { error?: string };
type RecentTranscriptionsResponse = { transcriptions?: RecentTranscription[] } & ApiErrorResponse;
type TranscribeResponse = { text?: string } & ApiErrorResponse;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDuration = (segments: TranscriptSegment[]) => {
  const durationSeconds = segments.reduce((max, segment) => Math.max(max, segment.end), 0);
  if (durationSeconds <= 0) {
    return "No duration";
  }

  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  return `${minutes} min${minutes === 1 ? "" : "s"}`;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [recentTranscriptions, setRecentTranscriptions] = useState<RecentTranscription[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectedFile = (selectedFile: File | null) => {
    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setError("");
    setTranscription("");
  };

  const fetchRecentTranscriptions = async () => {
    setIsLoadingRecent(true);
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/transcriptions`);
      const data = (await res.json()) as RecentTranscriptionsResponse;
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to fetch transcriptions");
      }
      setRecentTranscriptions(Array.isArray(data.transcriptions) ? data.transcriptions : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch transcriptions";
      setError(message);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  useEffect(() => {
    void fetchRecentTranscriptions();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    handleSelectedFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const selectedFile = e.dataTransfer.files?.[0] ?? null;
    handleSelectedFile(selectedFile);
  };

  const handleTranscribe = async () => {
    if (!file) {
      fileInputRef.current?.click();
      return;
    }

    setIsTranscribing(true);
    setError("");
    setTranscription("");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/transcribe`, {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as TranscribeResponse;

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to transcribe");
      }

      setTranscription(data.text ?? "");
      await fetchRecentTranscriptions();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to transcribe";
      setError(message);
    } finally {
      setIsTranscribing(false);
    }
  };

  const canPickFile = !file && !isTranscribing;

  return (
    <>
      <main className="flex-1 flex flex-col min-h-screen bg-[#fcf9f8]">

        <section className="p-5 lg:p-8 max-w-[1200px] w-full mx-auto flex-1 h-full">
          <div className="mb-8 lg:mb-10">
            <h2 className="text-[36px] lg:text-[42px] font-bold text-[#1c1b1b] mb-2 leading-tight">Dashboard Overview</h2>
            <p className="text-[#55433c] text-[16px] lg:text-[18px]">Welcome back. You have 3 hours of recording time available this month.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 items-start">
            <div className="flex flex-col gap-4">
              <div
                className="bg-[#6e3635] text-white p-6 rounded-xl flex flex-col justify-between min-h-[200px] hover:shadow-xl transition-all group cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => {
                  if (canPickFile) {
                    fileInputRef.current?.click();
                  }
                }}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && canPickFile) {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-4xl">{isTranscribing ? 'graphic_eq' : 'cloud_upload'}</span>
                  <span className="text-xs uppercase tracking-widest opacity-60">Processing</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 leading-tight">
                    {file ? file.name : "Upload Audio"}
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    {file
                      ? `${(file.size / 1024 / 1024).toFixed(2)} MB • Ready to transcribe!`
                      : "Support for MP3, WAV, M4A up to 500MB."}
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTranscribe(); }}
                      disabled={isTranscribing}
                      className="flex items-center gap-2 font-bold group-hover:gap-4 transition-all bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      {isTranscribing ? "Transcribing..." : (file ? "Process Audio" : "Select File")}
                      {!isTranscribing && <span className="material-symbols-outlined">file_upload</span>}
                    </button>
                    {file && !isTranscribing && (
                      <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-white/60 hover:text-white text-sm">Clear</button>
                    )}
                  </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
              </div>

              {error && (
                <div className="p-4 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-sm border border-[#ba1a1a]/20">
                  {error}
                </div>
              )}

              <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e2e1]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[24px] font-bold text-[#1c1b1b]">Recent Transcriptions</h3>
                  <a className="text-[#893b19] font-bold text-sm hover:underline" href="#">View All</a>
                </div>
                {isLoadingRecent ? (
                  <p className="text-sm text-[#88726b]">Loading recent transcriptions...</p>
                ) : recentTranscriptions.length === 0 ? (
                  <p className="text-sm text-[#88726b]">No transcriptions yet. Upload audio to get started.</p>
                ) : (
                  <div className="space-y-6">
                    {recentTranscriptions.map((item) => (
                      <div className="flex items-center justify-between group" key={item.id}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-[#ffe7df] flex items-center justify-center text-[#893b19]">
                            <span className="material-symbols-outlined">audio_file</span>
                          </div>
                          <div>
                            <p className="font-bold text-[#1c1b1b]">{item.title}</p>
                            <p className="text-xs text-[#88726b]">
                              {formatDate(item.createdAt)} • {formatDuration(item.transcriptSegments)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">Completed</span>
                          <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-[#f6f3f2] rounded-full transition-all" type="button">
                            <span className="material-symbols-outlined text-[#88726b]">more_vert</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#e5e2e1] min-h-[520px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[24px] font-bold text-[#1c1b1b]">Transcription Result</h3>
                {transcription && (
                  <button onClick={() => navigator.clipboard.writeText(transcription)} className="text-[#893b19] font-bold text-sm hover:underline">
                    Copy text
                  </button>
                )}
              </div>

              {transcription ? (
                <p className="text-[#1c1b1b] whitespace-pre-wrap leading-relaxed text-[16px] p-5 bg-[#f6f3f2] rounded-lg border border-[#e5e2e1] animate-in slide-in-from-bottom-4 fade-in min-h-[420px]">
                  {transcription}
                </p>
              ) : (
                <div className="h-full min-h-[420px] rounded-lg border border-dashed border-[#dbc1b8] bg-[#f6f3f2] flex items-center justify-center">
                  <div className="text-center px-8">
                    <span className="material-symbols-outlined text-5xl text-[#88726b]">notes</span>
                    <p className="text-[#55433c] text-[16px] mt-3 font-medium">Your transcription will appear here</p>
                    <p className="text-[#88726b] text-sm mt-2">Upload an audio file on the left and click Process Audio.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
