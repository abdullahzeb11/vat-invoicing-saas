import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Organization } from "@/lib/types";

export interface OrgContext {
  userId: string;
  email: string;
  organization: Organization;
  role: "owner" | "admin" | "member";
}

// React.cache memoizes the call within a single server request, so layout + page
// + nested server components all share the same Supabase lookup.
export const requireOrgContext = cache(async (): Promise<OrgContext> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("memberships")
    .select("role, organization:organizations(*)")
    .eq("user_id", user.id)
    .limit(1)
    .order("created_at", { ascending: true });

  const m = memberships?.[0];
  if (!m || !m.organization) redirect("/onboarding");

  return {
    userId: user.id,
    email: user.email ?? "",
    organization: m.organization as unknown as Organization,
    role: m.role as OrgContext["role"],
  };
});

export async function getOptionalUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
