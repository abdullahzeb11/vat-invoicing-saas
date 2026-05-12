import { PageHeader } from "@/components/app/page-header";
import { ProductForm } from "../product-form";
import { getLocale } from "@/lib/i18n/cookie";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function NewProductPage() {
  const t = getDictionary(await getLocale());
  return (
    <div>
      <PageHeader title={t.products.new} />
      <ProductForm dict={t} />
    </div>
  );
}
