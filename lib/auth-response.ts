interface SupabaseUserLike {
  id?: string;
  identities?: unknown[];
  email_confirmed_at?: string | null;
}

/**
 * Supabase's signUp() returns a 200 with an obfuscated user object (rather than
 * an error) when the email is already registered, to avoid leaking which emails
 * exist. The documented way to detect this is an empty `identities` array.
 */
export function isEmailAlreadyRegistered(user: SupabaseUserLike | null | undefined): boolean {
  if (!user) return false;
  if (!Array.isArray(user.identities)) return false;
  return user.identities.length === 0;
}

/**
 * True when the user has not clicked their confirmation email link yet.
 */
export function isEmailUnconfirmed(user: SupabaseUserLike | null | undefined): boolean {
  if (!user) return false;
  return !user.email_confirmed_at;
}
