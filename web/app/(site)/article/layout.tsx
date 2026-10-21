import type { Metadata } from "next";

export const metadata: Metadata = { title: "Article", description: "Training tips and stories from Dojo X." };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
