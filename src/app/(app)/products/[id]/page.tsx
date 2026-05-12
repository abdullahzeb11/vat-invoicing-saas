import { notFound } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { ProductForm } from "../product-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireOrgContext } from "@/lib/org-context";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Product } from "@/lib/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrgContext();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("organization_id", ctx.organization.id)
    .maybeSingle();
  if (!data) notFound();
  const t = getDictionary(await getLocale());
  return (
    <div>
      <PageHeader title={t.common.edit} />
      <ProductForm dict={t} initial={data as Product} />
    </div>
  );
}
