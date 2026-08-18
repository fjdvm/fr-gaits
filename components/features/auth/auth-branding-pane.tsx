import Image from "next/image";

export function AuthBrandingPane() {
  return (
    <div className="hidden md:flex md:w-5/12 bg-surface-container relative flex-col items-center justify-center text-center py-12 overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, var(--color-outline-variant) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative z-10 flex flex-col items-center w-full">
        <Image src="/logo.png" alt="GAITS" width={2172} height={724} className="w-full h-auto mb-12" priority />
        <div className="px-12">
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
    </div>
  );
}

export function AuthMobileLogo() {
  return (
    <div className="md:hidden w-full mb-8">
      <Image src="/logo.png" alt="GAITS" width={2172} height={724} className="w-full h-auto" priority />
    </div>
  );
}
