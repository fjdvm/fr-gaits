"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export function LegalPageLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface min-h-screen text-on-surface">
      <header className="border-b border-surface-container">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <Image src="/logo.png" alt="GAITS" width={2172} height={724} className="h-8 w-auto" priority />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-on-surface transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-xs text-secondary mb-10">Last updated: {updatedAt}</p>
        <div className="space-y-8 text-sm leading-relaxed text-on-surface">{children}</div>
      </main>
    </div>
  );
}
