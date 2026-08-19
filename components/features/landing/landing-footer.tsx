import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-on-background text-white py-12 border-t border-surface-dim">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Image
              src="/logo.png"
              alt="GAITS"
              width={2172}
              height={724}
              className="h-8 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-secondary-fixed-dim text-sm max-w-sm mb-6">
              Guided AI-Assisted Integrated Tutoring System — a web-based prototype
              for programming education built for both students and instructors.
              Integrates a browser-based code editor, assignment module, and a
              pedagogically guided AI tutor into one platform.
            </p>
            <a
              className="inline-flex items-center gap-2 text-secondary-fixed-dim hover:text-primary-fixed transition-colors"
              href="https://github.com/fjdvm/fr-gaits"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span className="text-sm font-medium">View on GitHub</span>
            </a>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-secondary-fixed-dim mb-4">
              For Students
            </h4>
            <ul className="space-y-3 text-sm text-secondary-fixed-dim">
              <li>
                <a className="hover:text-white transition-colors" href="#how-it-works">
                  How It Works
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#features">
                  Features
                </a>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/signup">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/login">
                  Log In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-secondary-fixed-dim mb-4">
              For Instructors
            </h4>
            <ul className="space-y-3 text-sm text-secondary-fixed-dim">
              <li>
                <a className="hover:text-white transition-colors" href="#how-it-works">
                  How It Works
                </a>
              </li>
              <li>
                <a className="hover:text-white transition-colors" href="#features">
                  Assignment Module
                </a>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/signup">
                  Register as Instructor
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/privacy">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-dim text-center text-sm text-secondary-fixed-dim">
          © 2026 GAITS — Guided AI-Assisted Integrated Tutoring System.
          <br className="sm:hidden" />
          {" "}An undergraduate research project by Martin, Dumlao &amp; Gabayno · Polytechnic University of the Philippines.
        </div>
      </div>
    </footer>
  );
}
