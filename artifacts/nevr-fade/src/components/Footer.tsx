import { Instagram, MessageCircle } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const logoSrc = "/nvrfadelogofav.png";

  return (
    <footer className="bg-primary pt-20 pb-10 w-full">
      <div className="container px-6 md:px-12 mx-auto">
        
        <div className="flex justify-center mb-16">
          <Link href="/" className="block">
            <img
              src={logoSrc}
              alt="NevrFade logo"
              className="h-16 md:h-20 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left mb-20">
          
          <div className="flex flex-col gap-4">
            <h4 className="font-sans text-xs tracking-widest text-accent uppercase mb-2">Explore</h4>
            <a href="/" className="font-sans text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">Home</a>
            <a href="#collections" className="font-sans text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">Collections</a>
            <a href="#about" className="font-sans text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">About</a>
            <a href="#story" className="font-sans text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">Story</a>
          </div>

          <div className="flex flex-col gap-4 items-center md:items-start">
            <h4 className="font-sans text-xs tracking-widest text-accent uppercase mb-2">Connect</h4>
            <a href="https://www.instagram.com/nevrfade.in?igsh=MWk0czZldGwzdDV1Yg==" target="_blank" rel="noopener noreferrer" className="font-sans text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors flex items-center gap-2">
              <Instagram size={16} /> Instagram
            </a>
            <a href="https://wa.me/919103586486" target="_blank" rel="noopener noreferrer" className="font-sans text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors flex items-center gap-2">
              <MessageCircle size={16} /> WhatsApp
            </a>
            <div className="mt-2 flex flex-col gap-2">
              <a href="mailto:contact@nevrfade.in" className="font-sans text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors block">
                contact@nevrfade.in
              </a>
              <a href="mailto:Founder@nevrfade.in" className="font-sans text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors block text-xs italic">
                Founder: Founder@nevrfade.in
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 items-center md:items-start">
            <h4 className="font-sans text-xs tracking-widest text-accent uppercase mb-2">Identity</h4>
            <p className="font-sans text-primary-foreground/60 text-sm leading-relaxed max-w-xs">
              Premium streetwear designed to last — in style, quality, and identity. Quality over everything.
            </p>
          </div>

        </div>

        <div className="pt-8 border-t border-primary-foreground/10 text-center">
          <p className="font-sans text-primary-foreground/40 text-xs tracking-widest uppercase">
            © 2025 NevrFade. All rights reserved.
          </p>
          <p className="mt-2">
            <a href="/super-admin-dashboard" className="text-accent hover:text-accent/80 transition-colors">
              Super Admin Dashboard
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
