const studentSteps = [
  {
    number: 1,
    title: "Sign Up & Join a Class",
    description:
      "Create your account and enroll in a class using the join code your instructor shares with you.",
  },
  {
    number: 2,
    title: "View Your Assignment",
    description:
      "See the instructions, requirements, and due date — all within GAITS, no LMS tab needed.",
  },
  {
    number: 3,
    title: "Code in the Browser",
    description:
      "Write and run your code directly inside GAITS in Python, C, JavaScript, or C#. No local IDE required.",
  },
  {
    number: 4,
    title: "Ask Your AI Tutor",
    description:
      "Stuck? Use your hearts to ask the AI tutor. It guides you with hints and questions, never just the answer.",
  },
];

const instructorSteps = [
  {
    number: 1,
    title: "Create a Class",
    description:
      "Set up a class in seconds. GAITS generates a unique join code you share with your students.",
  },
  {
    number: 2,
    title: "Post an Assignment",
    description:
      "Write the instructions, add test cases, choose the language, set the due date, and configure the AI tutor's hearts limit.",
  },
  {
    number: 3,
    title: "Review Submissions",
    description:
      "View every student's submitted code, automated test scores, and the AI chat history — all in one place.",
  },
  {
    number: 4,
    title: "Track Class Progress",
    description:
      "Monitor your class leaderboard and individual performance to identify students who need more support.",
  },
];

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 text-left">
      <div className="w-10 h-10 shrink-0 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center text-base font-bold shadow-sm">
        {number}
      </div>
      <div>
        <h4 className="text-base font-bold text-on-surface mb-1">{title}</h4>
        <p className="text-secondary text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">
            How It Works
          </h2>
          <p className="text-lg text-secondary">
            GAITS has a dedicated workflow for both sides of the programming
            classroom.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-surface rounded-3xl p-8 border border-surface-dim shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-container text-xl">
                  school
                </span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary-container">
                  For Students
                </p>
                <p className="text-sm text-secondary">
                  From enrollment to submission
                </p>
              </div>
            </div>
            <div className="space-y-6">
              {studentSteps.map((step) => (
                <StepCard key={step.number} {...step} />
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-8 border border-surface-dim shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface text-xl">
                  person_book
                </span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">
                  For Instructors
                </p>
                <p className="text-sm text-secondary">
                  From class setup to submission review
                </p>
              </div>
            </div>
            <div className="space-y-6">
              {instructorSteps.map((step) => (
                <StepCard key={step.number} {...step} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
