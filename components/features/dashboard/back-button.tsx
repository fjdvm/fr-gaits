"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

interface BackButtonProps {
  href: string;
  label?: string;
}

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="hidden sm:inline-flex items-center gap-1.5 px-4 md:px-10 pt-4 text-xs font-bold text-secondary hover:text-primary transition-colors"
    >
      <ArrowLeftIcon className="size-3.5" />
      {label}
    </Link>
  );
}
