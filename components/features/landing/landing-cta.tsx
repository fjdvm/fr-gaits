import Link from "next/link";

export function LandingCTA() {
  return (
    <section className="py-24 px-4 md:px-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary-container/5 -z-10"></div>
      <div className="max-w-4xl mx-auto bg-surface-container-lowest rounded-3xl p-12 text-center shadow-xl border border-surface-dim relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-container/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-surface-tint/10 rounded-full blur-2xl"></div>

        <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to transform your learning?</h2>
        <p className="text-secondary mb-10 max-w-xl mx-auto relative z-10" style={{ fontSize: '15px', lineHeight: '24px', letterSpacing: '0.01em' }}>
          Join thousands of students who are already using GAITS to study smarter, not harder. Start your 14-day free trial today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <Link className="bg-on-background text-on-primary px-8 py-4 rounded-xl text-sm font-semibold hover:bg-surface-tint transition-colors shadow-lg" href="/signup">
            Create Free Account
          </Link>
          <a className="bg-surface text-on-surface border border-surface-dim px-8 py-4 rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-colors" href="#">
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
}
