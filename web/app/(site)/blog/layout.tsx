import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog", description: "Training tips, fight camp stories and recovery advice from Dojo X coaches." };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
