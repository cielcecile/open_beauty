const ADMIN_EMAILS_ENV = [
  process.env.ADMIN_EMAILS,
  process.env.NEXT_PUBLIC_ADMIN_EMAILS,
]
  .filter(Boolean)
  .join(',');

export function getAdminEmails(): string[] {
  return ADMIN_EMAILS_ENV.split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  if (admins.length === 0) return false;
  return admins.includes(email.toLowerCase());
}
