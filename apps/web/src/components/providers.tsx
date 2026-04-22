"use client";

import { Toaster } from "@my-better-t-app/ui/components/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors />
    </>
  );
}
