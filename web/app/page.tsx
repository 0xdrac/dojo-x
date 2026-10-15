import { Hero, Marquee, Disciplines, Stats, Gallery, Location, FinalCta, Footer } from "@/components/Sections";
import Coaches from "@/components/Coaches";
import Pricing from "@/components/Pricing";
import Reviews from "@/components/Reviews";

export default function Home() {
  return (
    <main>
      <Hero /><Marquee /><Disciplines /><Stats /><Coaches /><Pricing /><Reviews /><Gallery /><Location /><FinalCta />
      <Footer />
    </main>
  );
}
