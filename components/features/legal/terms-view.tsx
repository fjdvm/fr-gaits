import { LegalPageLayout } from "./legal-page-layout";

export function TermsView() {
  return (
    <LegalPageLayout title="Terms of Service" updatedAt="August 19, 2026">
      <section>
        <h2 className="font-bold text-lg mb-2">1. Acceptance of Terms</h2>
        <p>
          By creating an account or using GAITS (&quot;the Service&quot;), you agree to be bound by these
          Terms of Service. If you do not agree, do not use the Service.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-lg mb-2">2. Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for
          all activity under your account. Each account is tied to a single email address and role
          (student, instructor, or admin).
        </p>
      </section>
      <section>
        <h2 className="font-bold text-lg mb-2">3. Acceptable Use</h2>
        <p>
          You agree not to misuse the Service, including attempting to bypass academic integrity
          safeguards, sharing another user&apos;s submissions as your own, or interfering with the
          normal operation of the platform.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-lg mb-2">4. Content and Submissions</h2>
        <p>
          Code and content you submit remain yours. By submitting, you grant instructors and the
          Service the right to store, display, and evaluate that content for the purpose of grading
          and instruction.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-lg mb-2">5. Termination</h2>
        <p>
          We may suspend or terminate accounts that violate these terms. You may stop using the
          Service at any time.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-lg mb-2">6. Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the Service after changes
          take effect constitutes acceptance of the revised terms.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-lg mb-2">7. Contact</h2>
        <p>Questions about these terms can be sent to the project maintainers via the GitHub repository.</p>
      </section>
    </LegalPageLayout>
  );
}
