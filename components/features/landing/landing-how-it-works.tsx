const steps = [
  { number: 1, title: "Sign Up & Join a Class", description: "Create your account and enroll in a class using a class code shared by your instructor." },
  { number: 2, title: "Receive Your Assignment", description: "Instructors post programming assignments with instructions, test cases, and a due date — all in one place." },
  { number: 3, title: "Code in the Browser", description: "Write and run your code directly inside GAITS — no separate IDE or document editor needed." },
  { number: 4, title: "Ask Your AI Tutor", description: "Stuck? Use your hearts to consult the AI tutor. It guides you with hints and questions, not ready-made answers." },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">How It Works</h2>
          <p className="text-lg text-secondary">From sign-up to submission — everything in four steps.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-md">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">{step.title}</h3>
              <p className="text-secondary text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
