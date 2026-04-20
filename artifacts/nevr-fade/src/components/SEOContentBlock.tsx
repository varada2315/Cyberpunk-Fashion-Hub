import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Activity, Globe, Leaf, Zap, CheckCircle2, ChevronRight, Star } from "lucide-react";

export default function SEOContentBlock() {
  return (
    <section className="bg-black text-zinc-300 py-32 px-6 md:px-12 w-full border-t border-zinc-900 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-zinc-900/40 rounded-full blur-3xl opacity-50 -z-10 mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-zinc-900/30 rounded-full blur-3xl opacity-50 -z-10 mix-blend-screen pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-8 mb-24 relative">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent -z-10"></div>
          <Badge className="bg-white text-black hover:bg-zinc-200 uppercase tracking-[0.3em] text-[10px] px-6 py-2 font-black">
            Brand Identity Framework
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black uppercase tracking-tighter leading-[0.9] text-white">
            NevrFade <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-300 to-zinc-700">
              Premium Clothing Brand <br/> In India That Never Fades
            </span>
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
          
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-16">
            
            {/* Identity Block */}
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-heading uppercase font-black text-white tracking-tight leading-none group flex items-center gap-4">
                NevrFade vs 
                <span className="line-through text-zinc-700 decoration-red-500/50 decoration-4">NeverFade</span>
              </h2>
              <div className="p-6 md:p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl backdrop-blur-sm space-y-4">
                <p className="text-lg leading-relaxed">
                  Many search for “NeverFade” when looking for NevrFade. While the spelling differs, <strong className="text-white">NevrFade</strong> is the original entity focused on premium clothing, gym wear, and timeless streetwear in India.
                </p>
                <p className="text-sm uppercase tracking-widest text-zinc-500 font-bold border-t border-zinc-800 pt-4 mt-4">
                  Searching for NeverFade? You’ve found NevrFade.
                </p>
              </div>
            </div>

            {/* Premium Quality */}
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-heading uppercase font-black text-white tracking-tight leading-none">
                Built to Last
              </h2>
              <p className="text-xl text-zinc-400 font-light leading-relaxed">
                NevrFade is more than fashion—it’s an identity. As a premium clothing brand in India, we obsess over clean design, high-quality fabric, and extreme longevity.
              </p>
              <div className="inline-flex items-center gap-3 bg-white/5 border border-zinc-800 px-5 py-3 rounded-2xl">
                <ShieldCheck className="text-white w-5 h-5" />
                <span className="text-white font-bold uppercase tracking-widest text-xs">Detail. Durability. Consistency.</span>
              </div>
            </div>

            {/* Performance Block */}
            <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-3xl space-y-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <Activity className="w-12 h-12 text-zinc-400" />
              <div className="space-y-4 relative z-10">
                <h2 className="text-2xl font-heading uppercase font-black text-white tracking-tight">
                  Premium Gym Wear
                </h2>
                <p className="text-zinc-400">Combining extreme comfort with relentless performance.</p>
                <ul className="space-y-3 pt-4">
                  {[
                    "Maximum comfort during high-intensity training",
                    "Breathable, flexible, and adaptive fabrics",
                    "A clean, minimal, distraction-free aesthetic",
                    "Engineered for everyday wear beyond the gym"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Zap className="w-4 h-4 text-white mt-1 shrink-0" />
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 space-y-8 md:space-y-16">
            
            {/* High Quality Features - Grid */}
            <div className="space-y-8">
              <h2 className="text-3xl lg:text-5xl font-heading uppercase font-black text-white tracking-tight leading-none">
                High Quality Fabric & <br/> Best Finishing
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, text: "Strong & Breathable Fabrics" },
                  { icon: CheckCircle2, text: "Flawless Smooth Stitching" },
                  { icon: Star, text: "Perfect Fit for Daily Wear" },
                  { icon: ShieldCheck, text: "Long-lasting Material Quality" }
                ].map((Feature, i) => (
                  <div key={i} className="p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-3xl flex flex-col gap-4 hover:bg-zinc-900 transition-colors">
                    <Feature.icon className="w-8 h-8 text-white" />
                    <span className="text-white font-bold uppercase tracking-wider text-sm">{Feature.text}</span>
                  </div>
                ))}
              </div>
              <p className="text-zinc-500 font-medium">For those searching for the best quality clothing or premium fabric apparel, NevrFade delivers an unparalleled tactile experience.</p>
            </div>

            {/* Made in India & Cruelty Free */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6">
                <Globe className="w-8 h-8 text-white" />
                <h3 className="text-xl font-heading uppercase font-black text-white">Made in India</h3>
                <p className="text-sm text-zinc-400">A premium standard with a global mindset. Ethical production, localized manufacturing, and ruthless quality control. Rooted in India, competing globally.</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl space-y-6">
                <Leaf className="w-8 h-8 text-white" />
                <h3 className="text-xl font-heading uppercase font-black text-white">Conscious Form</h3>
                <p className="text-sm text-zinc-400">100% cruelty-free approach. Fashion that aligns with conscious and responsible values. It shouldn't just feel good to wear, it should feel right to stand behind.</p>
              </div>
            </div>

            {/* Trendy yet Timeless */}
            <div className="p-8 md:p-12 border-2 border-zinc-800 rounded-3xl space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <span className="text-9xl font-black font-heading leading-none">NF</span>
               </div>
               <h2 className="text-3xl lg:text-4xl font-heading uppercase font-black text-white tracking-tight relative z-10">
                 Trendy Yet Timeless
               </h2>
               <p className="text-lg text-zinc-400 relative z-10 max-w-lg">
                 Balancing the latest streetwear trends with a minimal aesthetic. Always relevant. Never overdesigned. Effortlessly easy to style.
               </p>
            </div>

            {/* Summary List */}
            <div className="space-y-6 bg-white text-black p-8 md:p-12 rounded-3xl">
              <h2 className="text-2xl md:text-3xl font-heading uppercase font-black tracking-tight">
                Why Choose NevrFade
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                  "Premium clothing brand in India",
                  "Modern gym wear with comfort and style",
                  "High-quality fabric and finishing",
                  "Minimal and trendy designs",
                  "Cruelty-free approach",
                  "Made in India production"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <ChevronRight className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <p className="font-black uppercase tracking-widest text-sm pt-6 mt-6 border-t border-zinc-200">
                Quality • Identity • Consistency
              </p>
            </div>

          </div>
        </div>

        {/* Big Footer CTA */}
        <div className="mt-32 text-center space-y-8 flex flex-col items-center">
          <Badge className="bg-zinc-900 text-zinc-400 hover:bg-zinc-800 uppercase tracking-[0.4em] text-[10px] px-6 py-2 font-black border border-zinc-800">
            The Final Word
          </Badge>
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-heading font-black uppercase tracking-tighter text-white">
            For the ones who <br/>
            <span className="text-zinc-600">never fade.</span>
          </h2>
        </div>

      </div>
    </section>
  );
}
