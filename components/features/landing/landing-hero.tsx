import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex flex-col justify-center bg-surface">
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background:
            "linear-gradient(160deg, var(--color-primary-fixed) 0%, var(--color-primary-container) 100%)",
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-40 lg:h-56 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, var(--color-surface) 100%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-container/30 text-primary-container text-sm font-semibold border border-primary-container/20">
            <span className="material-symbols-outlined text-base">school</span>
            For Students
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-surface-container-high text-on-surface text-sm font-semibold border border-surface-dim">
            <span className="material-symbols-outlined text-base">person_book</span>
            For Instructors
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          The programming classroom,{" "}
          <br className="hidden md:block" />
          reimagined.
        </h1>

        <p className="mt-4 text-xl text-secondary max-w-2xl mx-auto mb-10">
          GAITS gives students a browser-based code editor with a guided AI tutor,
          and gives instructors a dedicated assignment module — all in a single platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-full text-white bg-on-background hover:bg-surface-tint transition-all shadow-lg hover:shadow-xl group"
            href="/signup"
          >
            Try the prototype
            <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
          <a
            className="inline-flex items-center justify-center px-8 py-4 border border-surface-dim text-base font-semibold rounded-full text-on-surface bg-surface hover:bg-surface-container-low transition-all shadow-sm group"
            href="#how-it-works"
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}
