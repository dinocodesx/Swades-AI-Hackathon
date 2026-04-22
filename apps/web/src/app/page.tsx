"use client";

import { useState, useRef } from "react";
import { env } from "@my-better-t-app/env/web";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError("");
      setTranscription("");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError("");
      setTranscription("");
    }
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to transcribe audio");
      }

      setTranscription(data.text);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <>
      <main className="flex-1 flex flex-col min-h-screen bg-[#fcf9f8]">
        <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 bg-[#fcf9f8]/90 backdrop-blur-md border-b border-[#e5e2e1]">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96 group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#88726b] group-focus-within:text-[#893b19] transition-colors">search</span>
              <input className="w-full pl-10 pr-4 py-2 bg-[#f6f3f2] border-transparent focus:border-[#893b19] focus:ring-0 rounded-lg text-sm transition-all" placeholder="Search transcriptions..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button className="p-2 text-[#55433c] hover:bg-[#f0edec] rounded-full transition-colors relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#893b19] rounded-full"></span>
              </button>
              <button className="p-2 text-[#55433c] hover:bg-[#f0edec] rounded-full transition-colors">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#893b19] text-white font-bold rounded-full hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50">
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>New Recording</span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-[#e5e2e1]">
              <div className="text-right">
                <p className="text-sm font-bold text-[#1c1b1b]">Admin Mode</p>
                <p className="text-[10px] text-[#88726b] uppercase tracking-wider">PREMIUM PLAN</p>
              </div>
            </div>
          </div>
        </header>

        <section className="p-8 max-w-[1400px] w-full mx-auto flex-1 h-full">
          <div className="mb-[48px]">
            <h2 className="text-[48px] font-bold text-[#1c1b1b] mb-2 leading-tight">Dashboard Overview</h2>
            <p className="text-[#55433c] text-[18px]">Welcome back. You have 3 hours of recording time available this month.</p>
          </div>

          <div className="flex flex-col gap-[16px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <div className="bg-[#893b19] text-white p-8 rounded-xl flex flex-col justify-between min-h-[224px] hover:shadow-xl transition-all group cursor-pointer">
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                  <span className="text-xs uppercase tracking-widest opacity-60">Real-time</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Record Live</h3>
                  <p className="text-white/80 text-sm mb-4">Instant transcription with multi-speaker detection.</p>
                  <div className="flex items-center gap-2 font-bold group-hover:gap-4 transition-all">
                    Start Session <span className="material-symbols-outlined">arrow_forward</span>
                  </div>
                </div>
              </div>

              <div
                className="bg-[#6e3635] text-white p-8 rounded-xl flex flex-col justify-between min-h-[224px] hover:shadow-xl transition-all group cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => (!file && !isTranscribing) ? fileInputRef.current?.click() : null}
              >
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-4xl">{isTranscribing ? 'graphic_eq' : 'cloud_upload'}</span>
                  <span className="text-xs uppercase tracking-widest opacity-60">Processing</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">
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
            </div>

            {error && (
              <div className="p-4 bg-[#ffdad6] text-[#ba1a1a] rounded-xl text-sm border border-[#ba1a1a]/20">
                {error}
              </div>
            )}

            {transcription && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-[#e5e2e1] animate-in slide-in-from-bottom-4 fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[24px] font-bold text-[#1c1b1b]">Transcription Result</h3>
                  <button onClick={() => navigator.clipboard.writeText(transcription)} className="text-[#893b19] font-bold text-sm hover:underline">Copy text</button>
                </div>
                <p className="text-[#1c1b1b] whitespace-pre-wrap leading-relaxed text-[16px] p-6 bg-[#f6f3f2] rounded-lg border border-[#e5e2e1]">
                  {transcription}
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#e5e2e1]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[24px] font-bold text-[#1c1b1b]">Recent Transcriptions</h3>
                <a className="text-[#893b19] font-bold text-sm hover:underline" href="#">View All</a>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#ffe7df] flex items-center justify-center text-[#893b19]">
                      <span className="material-symbols-outlined">audio_file</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#1c1b1b]">Product Strategy Sync</p>
                      <p className="text-xs text-[#88726b]">Oct 24, 2023 • 42 mins</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase">Completed</span>
                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-[#f6f3f2] rounded-full transition-all">
                      <span className="material-symbols-outlined text-[#88726b]">more_vert</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#ffe7df] flex items-center justify-center text-[#893b19]">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#1c1b1b]">User Research Interview #12</p>
                      <p className="text-xs text-[#88726b]">Oct 23, 2023 • 15 mins</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold uppercase">In Progress</span>
                    <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-[#f6f3f2] rounded-full transition-all">
                      <span className="material-symbols-outlined text-[#88726b]">more_vert</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
    </>
  );
}
