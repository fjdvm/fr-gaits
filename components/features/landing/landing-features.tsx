const features = [
  {
    icon: "bolt",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary-container",
    title: "Gamification",
    description: "Earn XP, maintain daily streaks, and unlock achievements as you progress through your personalized curriculum.",
  },
  {
    icon: "smart_toy",
    iconBg: "bg-surface-container-highest",
    iconColor: "text-on-surface",
    title: "AI Instructor",
    description: "Get instant, personalized feedback on assignments and concepts from our advanced AI tutor, available 24/7.",
  },
  {
    icon: "leaderboard",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface",
    title: "Leaderboards",
    description: "Compete with friends and learners worldwide in weekly challenges to climb the ranks and earn exclusive rewards.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">Powerful Features for Faster Learning</h2>
          <p className="text-lg text-secondary">Everything you need to stay motivated and achieve your learning goals.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-surface rounded-3xl p-8 shadow-sm border border-surface-dim hover:shadow-md transition-shadow"
            >
              <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center ${feature.iconColor} mb-6`}>
                <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3">{feature.title}</h3>
              <p className="text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
