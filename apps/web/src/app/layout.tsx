import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, Manrope } from "next/font/google";
import "../index.css";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-headline-lg",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-body-md",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "swadesh-ai-transcriber",
  description: "swadesh-ai-transcriber",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </head>
        <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${manrope.variable} antialiased font-body-md text-echo-body-md overflow-x-hidden bg-echo-surface text-echo-on-background`}>
          <Providers>
            <div className="flex h-screen bg-echo-surface">
              {children}
            </div>
          </Providers>
        </body>
    </html>
  );
}
