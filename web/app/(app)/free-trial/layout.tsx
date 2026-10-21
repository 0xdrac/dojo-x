import type { Metadata } from "next";

export const metadata: Metadata = { title: "Book a free trial", description: "Your first class at Dojo X is free. Pick a discipline and a slot." };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
