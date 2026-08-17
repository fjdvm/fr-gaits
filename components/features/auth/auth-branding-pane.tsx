import { School } from "lucide-react";

export function AuthBrandingPane() {
  return (
    <div className="hidden md:flex md:w-5/12 bg-surface-container relative flex-col items-center justify-center text-center p-12 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, var(--color-outline-variant) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-12 text-primary font-bold text-2xl">
          <School className="h-8 w-8 text-primary-container fill-primary-container" />
          <span className="font-sans tracking-tight text-on-surface">GAITS</span>
        </div>
        <h1 className="text-3xl font-bold text-on-surface mb-4 leading-tight">
          Embark on your
          <br />
          academic quest.
        </h1>
        <p className="text-sm text-secondary max-w-sm leading-relaxed">
          Join the realm where knowledge is your ultimate weapon. Level up
          your skills, complete challenges, and master your discipline.
        </p>
      </div>
    </div>
  );
}

export function AuthMobileLogo() {
  return (
    <div className="md:hidden flex justify-center mb-8">
      <div className="flex items-center gap-2 text-primary font-bold text-2xl">
        <School className="h-8 w-8 text-primary-container fill-primary-container" />
        <span className="font-sans tracking-tight text-on-surface">GAITS</span>
      </div>
    </div>
  );
}
