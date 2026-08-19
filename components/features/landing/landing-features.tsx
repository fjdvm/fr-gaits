type Audience = "student" | "instructor" | "both";

const features: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  audience: Audience;
}[] = [
  {
    icon: "code",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary-container",
    title: "Integrated Code Editor",
    description: "Write, run, and submit code in Python, C, JavaScript, or C# — directly in the browser. No installation, no extra apps.",
    audience: "student",
  },
  {
    icon: "smart_toy",
    iconBg: "bg-surface-container-highest",
    iconColor: "text-on-surface",
    title: "Guided AI Tutor",
    description: "When students are stuck, the AI tutor responds with hints and guiding questions — never just the full answer — preserving genuine learning.",
    audience: "student",
  },
  {
    icon: "favorite",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface",
    title: "Hearts System",
    description: "Each assignment has a limited number of AI consultations (hearts). Students must think before asking, building independent problem-solving habits.",
    audience: "both",
  },
  {
    icon: "assignment",
    iconBg: "bg-primary-container/10",
    iconColor: "text-primary-container",
    title: "Assignment Module",
    description: "Create programming tasks with detailed instructions, automated test cases, a language selector, due dates, and configurable AI tutor limits.",
    audience: "instructor",
  },
  {
    icon: "fact_check",
    iconBg: "bg-surface-container-high",
    iconColor: "text-on-surface",
    title: "Automated Scoring & Submission Review",
    description: "Every submission is automatically tested and scored. Instructors can review the student's code, test results, and AI chat history in one view.",
    audience: "instructor",
  },
  {
    icon: "leaderboard",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary-container",
    title: "Class Leaderboard",
    description: "Students can see how they rank within the class. Instructors get a clear view of overall class performance at a glance.",
    audience: "both",
  },
];

const audienceBadge: Record<Audience, { label: string; className: string }> = {
  student: {
    label: "Student",
    className: "bg-primary-container/20 text-primary-container",
  },
  instructor: {
    label: "Instructor",
    className: "bg-surface-container-highest text-on-surface",
  },
  both: {
    label: "Both",
    className: "bg-surface-container-high text-secondary",
  },
};

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">
            Everything You Need in One Platform
          </h2>
          <p className="text-lg text-secondary">
            GAITS replaces the fragmented LMS-IDE workflow with a purpose-built
            environment designed for both students and instructors.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const badge = audienceBadge[feature.audience];
            return (
              <div
                key={feature.title}
                className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-surface-dim hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center ${feature.iconColor}`}>
                    <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-3">{feature.title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-secondary">
          <span className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-primary-container/40" />
            Student feature
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-surface-container-highest" />
            Instructor feature
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-surface-container-high" />
            Both
          </span>
        </div>
      </div>
    </section>
  );
}
