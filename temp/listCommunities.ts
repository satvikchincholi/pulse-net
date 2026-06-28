// temp script to list communities
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

(async () => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from("communities").select("*");
  if (error) console.error("Error", error);
  else console.log("Communities:", data);
})();
