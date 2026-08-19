export function LandingProblem() {
  return (
    <section id="problem" className="py-24 bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-wider text-primary-container uppercase mb-2">
            The Problem &amp; Our Solution
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">
            Programming education is broken across too many tools.
          </h3>
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            Both students and instructors face a fragmented experience. GAITS fixes both sides of the classroom.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-surface-container-low rounded-3xl p-8 border border-surface-dim">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-container text-xl">school</span>
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-primary-container">
                For Students
              </span>
            </div>
            <h4 className="text-xl font-bold text-on-surface mb-3">
              Juggling three tools for one assignment.
            </h4>
            <div className="space-y-3 text-secondary text-sm leading-relaxed">
              <p>
                To submit a single programming task, students open an LMS for
                the instructions, a separate IDE to write the code, and a
                document editor to convert their work to a PDF for upload.
              </p>
              <p>
                When stuck, they switch to a browser tab and ask ChatGPT — which
                hands them a complete answer instead of helping them think.
                Over-reliance on these tools is linked to a measurable decline
                in critical thinking and independent problem-solving.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-3xl p-8 border border-surface-dim">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface text-xl">person_book</span>
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-secondary">
                For Instructors
              </span>
            </div>
            <h4 className="text-xl font-bold text-on-surface mb-3">
              Managing submissions with no visibility into how students coded.
            </h4>
            <div className="space-y-3 text-secondary text-sm leading-relaxed">
              <p>
                Instructors post assignments through an LMS, but receive PDF
                or document submissions with no way to verify the code actually
                runs. There is no built-in code execution or automated scoring.
              </p>
              <p>
                Reviewing each submission manually across disconnected platforms
                is time-consuming and provides little insight into how students
                approached the problem or whether the work is their own.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-lg text-secondary max-w-2xl mx-auto">
            GAITS brings the code editor, assignment module, and guided AI tutor into
            one platform — solving both problems at once.
          </p>
        </div>
      </div>
    </section>
  );
}
