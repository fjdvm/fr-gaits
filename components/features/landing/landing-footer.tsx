import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="bg-surface-container-lowest border-t border-surface-dim py-12 px-4 md:px-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            <span className="text-lg font-semibold text-on-surface">GAITS</span>
          </div>
          <p className="text-sm text-secondary">
            The intelligent platform for modern learners. Master any subject with your personal AI tutor.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4 text-on-surface">Product</h4>
          <ul className="space-y-2 text-sm text-secondary">
            <li><a className="hover:text-primary transition-colors" href="#">Features</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Pricing</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Student Stories</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4 text-on-surface">Company</h4>
          <ul className="space-y-2 text-sm text-secondary">
            <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4 text-on-surface">Legal</h4>
          <ul className="space-y-2 text-sm text-secondary">
            <li><Link className="hover:text-primary transition-colors" href="#">Privacy Policy</Link></li>
            <li><Link className="hover:text-primary transition-colors" href="#">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-surface-dim text-center text-sm text-secondary">
        © 2024 GAITS Inc. All rights reserved.
      </div>
    </footer>
  );
}
