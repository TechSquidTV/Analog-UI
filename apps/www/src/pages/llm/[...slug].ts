import { getDocBySlug, getDocsEntries } from "../../lib/docs";

export async function getStaticPaths() {
  const entries = await getDocsEntries();

  return entries.map((entry) => ({
    params: { slug: entry.slug },
  }));
}

export async function GET({ params }: { params: { slug?: string } }) {
  const entry = await getDocBySlug(params.slug);

  if (!entry) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(entry.body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
