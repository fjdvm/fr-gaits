import { LandingNav } from "./landing-nav";
import { LandingHero } from "./landing-hero";
import { LandingFeatures } from "./landing-features";
import { LandingCTA } from "./landing-cta";
import { LandingFooter } from "./landing-footer";

export function LandingView() {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-grow flex flex-col">
        <LandingHero />
        <LandingFeatures />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
