import Link from "next/link";

export function LandingNav() {
  return (
    <nav className="w-full top-0 bg-transparent flex justify-between items-center px-4 md:px-10 py-2 relative z-50">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
        <span className="text-2xl font-bold text-on-surface" style={{ lineHeight: '32px', letterSpacing: '-0.01em' }}>GAITS</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a className="text-lg font-semibold text-on-secondary-container hover:text-primary transition-all" href="#features">Features</a>
        <a className="text-lg font-semibold text-on-secondary-container hover:text-primary transition-all" href="#how-it-works">How it Works</a>
        <a className="text-lg font-semibold text-on-secondary-container hover:text-primary transition-all" href="#">Community</a>
      </div>
      <div className="flex items-center gap-4">
        <Link className="hidden md:block text-lg font-semibold text-on-secondary-container hover:text-primary transition-all" href="/login">Log in</Link>
        <Link className="bg-on-background text-on-primary px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-surface-tint transition-colors" href="/signup">Join the Academy</Link>
      </div>
    </nav>
  );
}
