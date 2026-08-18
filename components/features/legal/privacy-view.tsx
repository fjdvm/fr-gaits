import { LegalPageLayout } from "./legal-page-layout";

export function PrivacyView() {
  return (
    <LegalPageLayout title="Privacy Policy" updatedAt="August 19, 2026">
      <section>
        <h2 className="font-bold text-lg mb-2">1. Information We Collect</h2>
        <p>
          We collect the information you provide when creating an account (name, email, role), the
          code and answers you submit for assignments, and behavioral signals such as paste frequency
          and typing activity used to support academic integrity checks.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-lg mb-2">2. How We Use Information</h2>
        <p>
          We use this information to operate the Service: authenticating you, grading submissions,
          powering the AI tutor, gamification features, and class leaderboards, and improving the
          platform.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-lg mb-2">3. AI Providers</h2>
        <p>
          When you use the AI tutor, your messages and relevant assignment context are sent to the
          configured AI provider (e.g. Groq, OpenAI, Anthropic, or Google) to generate a response.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-lg mb-2">4. Data Sharing</h2>
        <p>
          Your instructor can view your submissions, scores, and behavioral signals for classes you
          are enrolled in. We do not sell personal data to third parties.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-lg mb-2">5. Data Retention</h2>
        <p>
          We retain account and submission data for as long as your account is active, or as needed
          to provide the Service.
        </p>
      </section>
      <section>
        <h2 className="font-bold text-lg mb-2">6. Your Choices</h2>
        <p>
          You can leave a class at any time, which removes your enrollment. Contact the project
          maintainers to request deletion of your account and associated data.
        </p>
      </section>
    </LegalPageLayout>
  );
}
