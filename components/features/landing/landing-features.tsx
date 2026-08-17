export function LandingFeatures() {
  return (
    <section id="features" className="py-24 bg-surface-container-lowest px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Designed for your success</h2>
          <p className="text-base text-secondary max-w-2xl mx-auto" style={{ fontSize: '15px', letterSpacing: '0.01em' }}>
            Everything you need to learn effectively, packaged in a beautiful, distraction-free environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureAITutor />
          <FeatureAnalytics />
          <FeatureGamified />
          <FeatureScheduling />
        </div>
      </div>
    </section>
  );
}

function FeatureAITutor() {
  return (
    <div className="bg-surface-container-low rounded-3xl p-8 col-span-1 md:col-span-2 flex flex-col justify-between overflow-hidden relative group">
      <div className="z-10">
        <span className="material-symbols-outlined text-4xl text-primary-container mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
        <h3 className="text-2xl font-bold mb-2" style={{ lineHeight: '32px', letterSpacing: '-0.01em' }}>Personalized AI Tutor</h3>
        <p className="text-secondary max-w-md" style={{ fontSize: '15px', lineHeight: '24px', letterSpacing: '0.01em' }}>
          Stuck on a concept? Your AI tutor is available 24/7 to explain difficult topics, provide hints, and guide you through challenges without just giving away the answers.
        </p>
      </div>
      <div className="mt-8 relative h-48 bg-surface rounded-xl border border-surface-dim overflow-hidden shadow-sm group-hover:-translate-y-2 transition-transform duration-300">
        <img
          className="w-full h-full object-cover opacity-80"
          alt="AI Tutor chat interface"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGe0s3sYnFzLoYIeXxKKC24FZw7f-OvktYV_d8zwGcCh1Ppli9lcZFDi90Wkd7-35S6d3X7Ssp0BmriXSkO1NEFt5DSg8Bm2c0-04FkVAneL5WH47Yi-MLWOPZMY0V_Mc1zejknHfNxngggQYup8QGUU-wa9J3qo0Bbo9NdbyvcQu9FO40QOMcS_P28h9Xdf9M7aMOyXTwvmY9bWuXEKxZLZJo5g-T5yEhCWjcvvDpelY1WqWkbjER"
        />
      </div>
    </div>
  );
}

function FeatureAnalytics() {
  return (
    <div className="bg-surface-container-low rounded-3xl p-8 col-span-1 flex flex-col justify-between overflow-hidden relative group">
      <div className="z-10">
        <span className="material-symbols-outlined text-4xl text-on-background mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
        <h3 className="text-xl font-bold mb-2" style={{ lineHeight: '32px', letterSpacing: '-0.01em' }}>Instructor Analytics</h3>
        <p className="text-secondary" style={{ fontSize: '15px', lineHeight: '24px', letterSpacing: '0.01em' }}>
          Track your progress over time with detailed visual insights into your learning habits.
        </p>
      </div>
      <div className="mt-8 flex justify-center">
        <div className="w-full h-32 flex items-end gap-2 px-4">
          <div className="w-full bg-surface-dim rounded-t-md h-1/3 group-hover:h-2/3 transition-all duration-500 delay-75"></div>
          <div className="w-full bg-surface-dim rounded-t-md h-1/2 group-hover:h-3/4 transition-all duration-500 delay-150"></div>
          <div className="w-full bg-primary-container rounded-t-md h-2/3 group-hover:h-full transition-all duration-500 delay-300 shadow-[0_0_15px_rgba(251,176,23,0.4)]"></div>
          <div className="w-full bg-surface-dim rounded-t-md h-1/4 group-hover:h-1/2 transition-all duration-500 delay-200"></div>
        </div>
      </div>
    </div>
  );
}

function FeatureGamified() {
  return (
    <div className="bg-on-background text-surface rounded-3xl p-8 col-span-1 flex flex-col justify-between overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-on-background to-surface-tint opacity-50 z-0"></div>
      <div className="z-10 relative">
        <span className="material-symbols-outlined text-4xl text-primary-container mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
        <h3 className="text-xl font-bold mb-2" style={{ lineHeight: '32px', letterSpacing: '-0.01em' }}>Gamified Path</h3>
        <p className="text-secondary-fixed-dim" style={{ fontSize: '15px', lineHeight: '24px', letterSpacing: '0.01em' }}>
          Earn XP, maintain streaks, and unlock achievements as you progress through your curriculum.
        </p>
      </div>
      <div className="mt-8 z-10 relative flex items-center justify-between bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <div>
            <p className="text-xs font-medium text-secondary-fixed-dim uppercase tracking-wider">Current Level</p>
            <p className="text-lg font-semibold">Scholar</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-primary-fixed" style={{ lineHeight: '32px', letterSpacing: '-0.01em' }}>Lvl 12</span>
      </div>
    </div>
  );
}

function FeatureScheduling() {
  return (
    <div className="bg-surface-container-low rounded-3xl p-8 col-span-1 md:col-span-2 flex flex-col justify-center items-center text-center overflow-hidden relative">
      <div className="w-20 h-20 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm mb-6">
        <span className="material-symbols-outlined text-4xl text-on-surface" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
      </div>
      <h3 className="text-2xl font-bold mb-2" style={{ lineHeight: '32px', letterSpacing: '-0.01em' }}>Smart Scheduling</h3>
      <p className="text-secondary max-w-lg" style={{ fontSize: '15px', lineHeight: '24px', letterSpacing: '0.01em' }}>
        Integrate your homework deadlines and study sessions directly into your calendar. We&apos;ll remind you when it&apos;s time to focus.
      </p>
    </div>
  );
}
