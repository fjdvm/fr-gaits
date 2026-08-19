export function deriveNameFromEmail(email: string): string {
  const localPart = email.split("@")[0] || email;
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getDisplayName(user: { name?: string | null; email: string }): string {
  return user.name?.trim() || deriveNameFromEmail(user.email);
}
