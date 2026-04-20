import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

export default function SEOLanding() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col w-full overflow-hidden">
      <Navbar />
      
      {/* Hero Section for SEO page */}
      <section className="pt-32 pb-16 px-6 md:px-12 max-w-5xl mx-auto w-full">
        <div className="space-y-6 text-center">
          <Badge className="bg-black text-white hover:bg-black uppercase tracking-widest text-xs px-4 py-1">
            Brand Identity
          </Badge>
          <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-tighter leading-tight">
            NevrFade – Premium Clothing Brand in India That Never Fades
          </h1>
          <div className="w-24 h-1 bg-black mx-auto mt-8 mb-12"></div>
        </div>
        
        <div className="prose prose-lg prose-zinc mx-auto mt-16 max-w-4xl space-y-16">
          
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-heading uppercase font-bold tracking-tight border-b pb-2">
              NevrFade vs NeverFade – Are They the Same?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Many people search for “NeverFade” when looking for NevrFade. While the spelling may differ, <strong>NevrFade</strong> is the original brand focused on premium clothing, gym wear, and timeless streetwear in India.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If you’re searching for NeverFade clothing, you’re likely looking for NevrFade.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-heading uppercase font-bold tracking-tight border-b pb-2">
              A Premium Clothing Brand Built to Last
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              NevrFade is more than fashion—it’s identity. As a premium clothing brand in India, we focus on clean design, high-quality fabric, and long-lasting wear.
            </p>
            <p className="text-muted-foreground leading-relaxed font-semibold">
              Premium isn’t about being loud. It’s about detail, durability, and consistency.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-heading uppercase font-bold tracking-tight border-b pb-2">
              Premium Gym Wear That Combines Comfort and Performance
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              NevrFade also brings a modern approach to gym wear in India.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-2">Our gym wear is designed for:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Comfort during workouts</li>
              <li>Breathable and flexible fabrics</li>
              <li>Clean, minimal aesthetic</li>
              <li>Everyday wear beyond the gym</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Whether you’re training or styling casually, NevrFade gym wear is built to perform and look premium.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-heading uppercase font-bold tracking-tight border-b pb-2">
              High Quality Fabric and Best Finishing Clothing
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              Every product is crafted with attention to detail:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Strong and breathable fabrics</li>
              <li>Smooth stitching and finishing</li>
              <li>Comfortable fit for daily wear</li>
              <li>Long-lasting material quality</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If you’re searching for best quality clothing or premium fabric apparel, NevrFade delivers on both feel and durability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-heading uppercase font-bold tracking-tight border-b pb-2">
                Made in India with a Premium Standard
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                NevrFade is a Made in India clothing and gym wear brand with a global mindset.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Ethical production</li>
                <li>Local manufacturing</li>
                <li>Strict quality control</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Our aim is to create globally competitive products while staying rooted in India.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-heading uppercase font-bold tracking-tight border-b pb-2">
                Cruelty-Free and Conscious Clothing
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                NevrFade follows a cruelty-free approach, ensuring that our clothing aligns with conscious and responsible values.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We believe fashion should feel good—not just to wear, but to stand behind.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-8">
            <h2 className="text-2xl md:text-3xl font-heading uppercase font-bold tracking-tight border-b pb-2">
              Trendy Yet Timeless Streetwear
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              NevrFade balances trending designs with minimal aesthetics.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-2">This means:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Always relevant</li>
              <li>Never overdesigned</li>
              <li>Easy to style</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              If you’re looking for trending clothing, latest streetwear, or minimal premium outfits, NevrFade fits naturally into your wardrobe.
            </p>
          </div>

          <div className="bg-zinc-50 p-8 rounded-3xl mt-12 mb-12">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-heading uppercase font-bold tracking-tight border-b pb-2 border-zinc-200">
                Designed for Those Who Never Fade
              </h2>
              <p className="text-zinc-600 leading-relaxed">
                NevrFade is built for individuals who stay consistent, real, and original.
              </p>
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-sm mt-4">
                Not for hype. Not for noise. <br />
                For those who don’t fade with trends.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-heading uppercase font-bold tracking-tight border-b pb-2">
              Why Choose NevrFade
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Premium clothing brand in India</li>
              <li>Modern gym wear with comfort and style</li>
              <li>High-quality fabric and finishing</li>
              <li>Minimal and trendy designs</li>
              <li>Cruelty-free approach</li>
              <li>Made in India production</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed font-bold mt-4 text-lg">
              NevrFade stands for quality, identity, and consistency.
            </p>
          </div>

          <div className="text-center pt-16 pb-8">
            <h2 className="text-3xl md:text-5xl font-heading font-black uppercase tracking-tighter">
              Built for the ones who never fade.
            </h2>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
