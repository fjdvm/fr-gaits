const steps = [
  { number: 1, title: "Sign Up", description: "Create your free account and set up your learning profile." },
  { number: 2, title: "Choose a Course", description: "Browse our extensive library and pick what you want to learn." },
  { number: 3, title: "Learn with AI", description: "Engage with your AI tutor for personalized lessons and feedback." },
  { number: 4, title: "Earn Rewards", description: "Gain XP, unlock achievements, and climb the leaderboard." },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">How It Works</h2>
          <p className="text-lg text-secondary">Your journey to mastery in four simple steps.</p>
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
