"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "#problem" },
  { label: "Feature", href: "#features" },
];

export function LandingMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="text-on-surface md:hidden"
      >
        <MenuIcon />
        <span className="sr-only">Open menu</span>
      </Button>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation and account links</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col px-4 gap-1">
          {navLinks.map((link) => (
            <SheetClose
              key={link.label}
              render={
                <Link
                  href={link.href}
                  className="py-3 px-2 rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors"
                />
              }
            >
              {link.label}
            </SheetClose>
          ))}
        </nav>
        <div className="flex flex-col gap-2 px-4 mt-4 border-t border-surface-container pt-4">
          <SheetClose
            render={
              <Link
                href="/login"
                className="py-2.5 text-center text-sm font-medium text-secondary hover:text-primary transition-colors"
              />
            }
          >
            Log in
          </SheetClose>
          <SheetClose
            render={
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-full text-on-primary-container bg-primary-container hover:bg-primary-fixed transition-colors shadow-sm hover:shadow-md"
              />
            }
          >
            Join now
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
