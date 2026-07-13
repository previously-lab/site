import { redirect } from "next/navigation";
import { flattenDocs } from "@/lib/docs/manifest";

/** /docs -- redirect to the first doc page in the manifest. */
export default async function DocsIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const first = flattenDocs()[0];
  const slug = first?.slug ?? "introduction";

  redirect(`/${locale}/docs/${slug}`);
}
