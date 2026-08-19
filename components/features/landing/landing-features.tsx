const features = [
  {
    icon: "code",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary-container",
    title: "Integrated Code Editor",
    description: "Write, run, and submit code in Python, C, JavaScript, or C# — directly in your browser. No setup, no extra apps.",
  },
  {
    icon: "smart_toy",
    iconBg: "bg-surface-container-highest",
    iconColor: "text-on-surface",
    title: "Guided AI Tutor",
    description: "Ask the AI tutor when you're stuck. It responds with hints and guiding questions — never just handing you the answer — so you genuinely learn.",
  },
  {
    icon: "favorite",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface",
    title: "Hearts System",
    description: "Each assignment comes with a limited number of AI interactions (hearts). Spend them wisely — this encourages you to think before you ask.",
  },
  {
    icon: "assignment",
    iconBg: "bg-primary-container/10",
    iconColor: "text-primary-container",
    title: "Assignment Module",
    description: "Instructors create and manage programming tasks with instructions, test cases, and due dates — all visible to students in one place.",
  },
  {
    icon: "leaderboard",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface",
    title: "Class Leaderboard",
    description: "Track your standing within your class and stay motivated to improve your scores and submission quality.",
  },
  {
    icon: "school",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary-container",
    title: "Student & Instructor Dashboards",
    description: "Separate views tailored for students and instructors — with class management, assignment tracking, and submission review built in.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">Everything You Need in One Platform</h2>
          <p className="text-lg text-secondary">GAITS replaces your fragmented LMS-IDE workflow with a single, purpose-built environment for programming education.</p>
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
