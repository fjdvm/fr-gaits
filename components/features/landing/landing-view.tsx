import { LandingNav } from "./landing-nav";
import { LandingHero } from "./landing-hero";
import { LandingProblem } from "./landing-problem";
import { LandingHowItWorks } from "./landing-how-it-works";
import { LandingFeatures } from "./landing-features";
import { LandingFooter } from "./landing-footer";

export function LandingView() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-grow flex flex-col">
        <LandingHero />
        <LandingProblem />
        <LandingHowItWorks />
        <LandingFeatures />
      </main>
      <LandingFooter />
    </div>
  );
}
