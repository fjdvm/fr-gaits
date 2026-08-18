import Link from "next/link";
import Image from "next/image";

export function LandingNav() {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-surface-dim">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Image src="/logo.png" alt="GAITS" width={2172} height={724} className="h-9 w-auto" priority />

          <nav className="hidden md:flex space-x-8">
            <Link className="text-sm font-medium text-on-surface hover:text-primary transition-colors" href="/">Home</Link>
            <a className="text-sm font-medium text-secondary hover:text-primary transition-colors" href="#problem">About</a>
            <a className="text-sm font-medium text-secondary hover:text-primary transition-colors" href="#features">Feature</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link className="text-sm font-medium text-secondary hover:text-primary transition-colors" href="/login">
              Log in
            </Link>
            <Link
              className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-full text-on-primary-container bg-primary-container hover:bg-primary-fixed transition-colors shadow-sm hover:shadow-md"
              href="/signup"
            >
              Join now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
