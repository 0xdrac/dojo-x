import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./globals.css";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dojo-x.vercel.app"),
  title: { default: "Dojo X Fight Academy · Vasundhara, Ghaziabad", template: "%s · Dojo X Fight Academy" },
  openGraph: { siteName: "Dojo X Fight Academy", type: "website", locale: "en_IN" },
  description: "MMA, boxing, kickboxing, Muay Thai, karate, gymnastics and yoga in Vasundhara, Ghaziabad. Your first class is free.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0D0D0D" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/anton.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/manrope.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
