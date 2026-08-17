import Link from "next/link";

export function LandingHero() {
  return (
    <section className="relative pt-20 pb-32 px-4 md:px-10 overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-container/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-surface-container-highest/40 rounded-full blur-3xl -z-10 -translate-x-1/4 translate-y-1/4"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high mb-6 border border-surface-dim">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
            <span className="text-xs font-medium tracking-wide text-on-surface-variant">The Future of Learning</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Master new skills with your{" "}
            <span className="text-primary-container relative inline-block">
              AI Tutor
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary-container/30" preserveAspectRatio="none" viewBox="0 0 100 10">
                <path d="M0 5 Q 50 10 100 5" fill="transparent" stroke="currentColor" strokeWidth="4" />
              </svg>
            </span>
          </h1>

          <p className="text-base text-secondary mb-8 leading-relaxed" style={{ fontSize: '15px', letterSpacing: '0.01em' }}>
            GAITS combines personalized AI guidance with gamified progression. Learn faster, stay motivated, and achieve your goals with a curriculum that adapts to you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              className="bg-primary-container text-on-primary-container px-8 py-4 rounded-xl text-sm font-semibold text-center hover:bg-primary-fixed transition-colors shadow-sm flex items-center justify-center gap-2 group"
              href="/signup"
            >
              Start Learning for Free
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <a
              className="bg-surface-container-lowest text-on-surface border border-surface-dim px-8 py-4 rounded-xl text-sm font-semibold text-center hover:bg-surface-container-low transition-colors shadow-sm"
              href="#features"
            >
              See How it Works
            </a>
          </div>

          <div className="mt-8 flex items-center gap-4 text-sm text-on-surface-variant">
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-surface object-cover" alt="Student 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsNLLh6UMxfUOYklTaz32PT494iGflSHrpFgQcLOFXls5YfEhHJwr80p93Ypoq8oDkvQIE08SnEsVlV9u7Eyuj4aVQEONUSun-S7H08xlsi3bXF4vW3zsIgHA7xSS24HSDOmh3e52YfgInmzo6-mDwLjTZIHJ-kySaVtuoH3l6wIuPm1lFpKla4Z6WMhut5lyWg0QS4X5MS8iwBIIlfLrzK5BsA_POhEKYe1IcLYu2b73OhvusYokO" />
              <img className="w-10 h-10 rounded-full border-2 border-surface object-cover" alt="Student 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsuhgK2z4sJE4VaOjDmw0S_ijUwMs-_bobfI0jxD0n8AEYNtBe2kCi1RhYejx40Ml5rskoMdpOB0bRTdHlhpzxmxstc3tGiQENIXm-hfik051XyKIwZ8xkxAz63n7cxou2ZJiCu9lJnvCcQRQLh2gzPFmuvKiQTEghJ76AvU7CNVv0osZowayQfX2va-7nro8wCM5y415JSeJsbjADnYA06wWXrBhDvGPdO0VFTqSi4RlhwP6BHlzJ" />
              <img className="w-10 h-10 rounded-full border-2 border-surface object-cover" alt="Student 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBosY_4rQCH37Nhw9ukxfTtXLG1L-wwUzgzU9b4IvOhDVbbwvolhMgCBZ5plKEt9VMSMwsLF6YwnIWnnEt5j06Z85KBOTqNcyw3-_qQ0dMxx5Mo2C7om-xZ5cG64UFjQaVtHovvBOjVct7BQh5SZR-JER_h9v2M4ixXytaZy8Y7suL3RuuTQkaTdFNCYpc42DU11U7KvREKCrCHBEsGVYVvZwQY2rX6lYZcIOd4mpRW71GXHEYmULab" />
            </div>
            <p><span className="font-bold text-on-surface">10k+</span> students already joined</p>
          </div>
        </div>

        <div className="relative w-full aspect-square md:aspect-auto md:h-[600px]">
          <img
            alt="GAITS Platform Dashboard Mockup"
            className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl z-10"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaxUyQl-AoN4OXxih6hps1-byvJOkSWJP7gGK-10AH4NSUIKOjZqrKccNpqiMqfIiTaVKHtNX9YhPao62ZBDIai0llU1eu-k96Xrw6Ki_AATReidp0bdSJceVLg_y3vSRO1nuUpiQMTog7y_XF1kb8zwHJb-GZhEMeTflR4vyxIJhOMNsBZ9sepgwa1ZGOHyDhAFNG1Zigrh7l7iXCNbt9iCYUQXPiNhsCIvj6caWdPqlFztvLQyTh01N6CavhOVFu1Q"
          />

          <div className="absolute top-10 -left-10 glass-card p-4 rounded-2xl flex items-center gap-4 z-20 shadow-lg animate-bounce" style={{ animationDuration: '4s' }}>
            <div className="bg-primary-container/20 p-2 rounded-lg text-primary-container">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">5 Day Streak!</p>
              <p className="text-xs font-medium text-secondary">+50 XP earned</p>
            </div>
          </div>

          <div className="absolute bottom-20 -right-5 glass-card p-4 rounded-2xl flex items-center gap-4 z-20 shadow-lg animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
            <div className="bg-surface-container-highest p-2 rounded-lg text-on-surface">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>done_all</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">Lesson Completed</p>
              <p className="text-xs font-medium text-secondary">UX Fundamentals</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
