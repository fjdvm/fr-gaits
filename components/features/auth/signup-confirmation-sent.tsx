import { MailCheck } from "lucide-react";

export function SignupConfirmationSent({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-start">
      <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary mb-4">
        <MailCheck className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Check your inbox</h2>
      <p className="text-sm text-secondary leading-relaxed">
        We sent a confirmation link to <span className="font-semibold text-on-surface">{email}</span>.
        Click it to verify your account, then come back and log in.
      </p>
    </div>
  );
}
