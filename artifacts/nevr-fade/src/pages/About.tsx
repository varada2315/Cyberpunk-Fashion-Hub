import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import About from "@/components/About";
import Story from "@/components/Story";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background w-full overflow-hidden">
      <Navbar />
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="pt-24"
      >
        <div className="container px-6 md:px-12 mx-auto">
          <div className="text-center mb-20">
            <h1 className="font-heading text-5xl md:text-7xl leading-[0.9] text-foreground mb-6">
              About NevrFade
            </h1>
            <p className="font-sans text-foreground/80 text-base md:text-lg max-w-3xl mx-auto leading-[1.8]">
              NevrFade Clothing Brand is a modern streetwear label built on one belief — some people don't fade... they rise.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg md:prose-xl max-w-none">
              <p className="font-sans text-foreground/90 text-base md:text-lg leading-relaxed">
                Created for the ones who keep moving even when life gets loud, NevrFade stands for consistency, self-belief and silent strength. Every piece we make is designed to match that mindset — clean, bold and timeless.
              </p>
              
              <h2 className="font-heading text-3xl text-foreground mt-12 mb-6">WHAT WE CREATE</h2>
              <ul className="font-sans text-foreground/80 text-base md:text-lg leading-relaxed space-y-2">
                <li>• Premium-quality T-shirts</li>
                <li>• Essential Gym Sandos</li>
                <li>• Limited drops & signature designs</li>
              </ul>
              <p className="font-sans text-foreground/80 text-base md:text-lg leading-relaxed mt-4">
                Each product is made with attention to detail, comfort, and long-lasting quality.
              </p>
              
              <h2 className="font-heading text-3xl text-foreground mt-12 mb-6">OUR STORY</h2>
              <p className="font-sans text-foreground/80 text-base md:text-lg leading-relaxed">
                NevrFade clothing brand started with a simple idea: Clothing should reflect the attitude of those who refuse to blend in.
              </p>
              <p className="font-sans text-foreground/80 text-base md:text-lg leading-relaxed mt-4">
                Born from passion and crafted with intention, NevrFade represents the journey of people who hustle quietly, grow steadily and never stop evolving.
              </p>
              
              <h2 className="font-heading text-3xl text-foreground mt-12 mb-6">OUR VISION</h2>
              <p className="font-sans text-foreground/80 text-base md:text-lg leading-relaxed">
                To build a community of individuals who live with purpose — who work hard, dream big and never fade from who they truly are.
              </p>
              
              <h2 className="font-heading text-3xl text-foreground mt-12 mb-6">THE MINDSET</h2>
              <p className="font-sans text-foreground/80 text-base md:text-lg leading-relaxed">
                NevrFade is more than a clothing brand — it's a reminder: "Built for the ones who never fade."
              </p>
              <p className="font-sans text-foreground/80 text-base md:text-lg leading-relaxed mt-4">
                If you're someone who chooses discipline over excuses, growth over comfort, and authenticity over crowd-following... you're already part of our story.
              </p>

              <h2 className="font-heading text-3xl text-foreground mt-12 mb-6 uppercase tracking-tighter">Founder</h2>
              <div className="bg-card border border-border p-8 rounded-3xl mt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="font-heading text-2xl text-foreground mb-1">Nikhil Manhas</h3>
                    <p className="font-sans text-muted-foreground uppercase tracking-widest text-xs font-bold mb-4">Founder of NevrFade</p>
                    <p className="font-sans text-foreground/70 text-sm leading-relaxed max-w-md">
                      Driven by the vision to create a brand that stays real in a world of copies. Nikhil established NevrFade to empower individuals through premium design and a consistent mindset.
                    </p>
                  </div>
                  <a 
                    href="https://www.instagram.com/iamnikhilmanhas?igsh=NmF5OWI3dGZheDdr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-8 py-3 bg-primary text-primary-foreground rounded-full font-sans font-bold uppercase tracking-widest text-xs transition-all hover:bg-accent hover:text-primary shrink-0"
                  >
                    <Instagram size={18} />
                    Follow Nikhil
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
      
      <About />
      <Story />
      <Footer />
    </main>
  );
}