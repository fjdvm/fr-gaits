import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex flex-col justify-center">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(160deg, var(--color-primary-fixed) 0%, var(--color-primary-container) 100%)",
        }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          Master your craft with <br className="hidden md:block" /> AI Tutor
        </h1>

        <p className="mt-4 text-xl text-secondary max-w-2xl mx-auto mb-10">
          Experience the next generation of learning with GAITS. Personalized, gamified, and driven by advanced AI.
        </p>

        <Link
          className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-full text-white bg-on-background hover:bg-surface-tint transition-all shadow-lg hover:shadow-xl group"
          href="/signup"
        >
          Explore all courses
          <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </Link>
      </div>
    </section>
  );
}
