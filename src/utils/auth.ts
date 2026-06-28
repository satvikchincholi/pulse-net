import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Checks if a user is authenticated server‑side.
 * If not, redirects to the citizen login page.
 */
export async function requireAuth(): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/citizen/login');
  }
}
