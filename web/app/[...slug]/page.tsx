import { notFound } from "next/navigation";
import TLink from "@/components/TLink";
import { Footer } from "@/components/Sections";
import { DISCIPLINES, NAV } from "@/lib/data";

const EXTRA = ["login", "faqs", "blog", "free-trial"];
const titles = new Map<string, string>([
  ...NAV.map(([l, h]) => [h.slice(1), l] as [string, string]),
  ...DISCIPLINES.map((d) => [`disciplines/${d.slug}`, d.name] as [string, string]),
  ["login", "Member Login"], ["faqs", "FAQs"], ["blog", "Blog"], ["free-trial", "Free Trial"],
]);

export const dynamicParams = false;
export function generateStaticParams() {
  return [...NAV.map(([, h]) => h.slice(1)), ...EXTRA, ...DISCIPLINES.map((d) => `disciplines/${d.slug}`)].map((s) => ({ slug: s.split("/") }));
}

export default async function Stub({ params }: { params: Promise<{ slug: string[] }> }) {
  const key = (await params).slug.join("/");
  const title = titles.get(key);
  if (!title) notFound();
  return (
    <main>
      <div className="stub">
        <div className="eyebrow">COMING SOON</div>
        <h1 className="anton">{title}<span className="red">.</span></h1>
        <p style={{ maxWidth: 440, fontSize: 16, lineHeight: 1.6, color: "var(--mid)" }}>This page is designed and on its way. For now, head back home or book a free trial.</p>
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}><TLink href="/" className="ghost" style={{ padding: "0 28px" }}><span>← Home</span></TLink></div>
      </div>
      <Footer />
    </main>
  );
}
