import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gallery", description: "Inside Dojo X Academy." };
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
