export function LandingProblem() {
  return (
    <section id="problem" className="py-24 bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-sm font-bold tracking-wider text-primary-container uppercase mb-2">The Problem & Our Solution</h2>
        <h3 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-6">Programming education is broken across too many tools.</h3>
        <div className="space-y-6 text-lg text-secondary">
          <p>
            Students enrolled in programming courses are forced to juggle an LMS for instructions,
            a separate IDE for writing code, and a document editor just to submit a single assignment.
            This fragmented workflow adds unnecessary friction — taking focus away from actually learning to code.
          </p>
          <p>
            On top of that, general-purpose AI tools like ChatGPT hand students ready-made answers
            instead of guiding them to think. Over-reliance on these tools is linked to a measurable
            decline in critical thinking and independent problem-solving.
          </p>
          <p>
            GAITS solves both problems — a single platform where students write, run, and submit code
            alongside an AI tutor designed to guide, not give away the answer.
          </p>
        </div>
      </div>
    </section>
  );
}
