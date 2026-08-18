import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fredoka, Space_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { FeedbackButton } from "@/components/features/feedback/feedback-button";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-heading",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GAIT Platform",
  description: "Gamified AI-Assisted Integrated Tutoring System",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${fredoka.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <FeedbackButton />
        <Toaster />
      </body>
    </html>
  );
}
