export function getAdminEmails(): string[] {
  const envValues = [
    process.env.ADMIN_EMAILS,
    process.env.NEXT_PUBLIC_ADMIN_EMAILS,
  ];

  const fallbackAdmins = ['kohyejin@gmail.com'];

  const joined = envValues.filter(Boolean).join(',');
  const dynamicAdmins = joined.split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set([...dynamicAdmins, ...fallbackAdmins]));
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  return admins.includes(email.toLowerCase());
}

/**
 * Checks if an email is an admin by checking both ENV and Database whitelist.
 */
export async function checkIsAdmin(email: string | null | undefined, supabase: any): Promise<boolean> {
  if (!email) return false;

  // 1. Check ENV (fast)
  if (isAdminEmail(email)) return true;

  // 2. Check Database (dynamic)
  try {
    const { data, error } = await supabase
      .from('admin_whitelist')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    return !!data && !error;
  } catch (e) {
    return false;
  }
}
