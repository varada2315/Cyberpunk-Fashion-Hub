import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Collections from "@/components/Collections";
import Story from "@/components/Story";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";
import SEOContentBlock from "@/components/SEOContentBlock";

export default function Home() {
  return (
    <main className="min-h-screen bg-background w-full overflow-hidden">
      <Navbar />
      <Hero />
      <Marquee />
      <About />
      <Collections />
      <Story />
      <CtaBanner />
      <SEOContentBlock />
      <Footer />
    </main>
  );
}
