import { motion } from "framer-motion";

export default function Story() {
  return (
    <section id="story" className="py-24 md:py-32 bg-primary w-full overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
        opacity: 0.1
      }} />
      
      <div className="container px-6 md:px-12 mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-heading text-6xl md:text-8xl leading-[0.9] text-primary-foreground">
              NOT JUST CLOTHING.<br />
              <span className="text-accent">AN IDENTITY.</span>
            </h2>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-12"
          >
            <p className="font-sans text-primary-foreground/70 text-base md:text-lg leading-[1.8]">
              The streets demanded something real. We stripped away the noise, the fast trends, the compromised quality. What remains is pure intention. NevrFade was born from a desire to create pieces that speak before you do, garments that feel like armor, designed to weather both the elements and the test of time.
            </p>

            <div className="flex flex-col gap-8">
              <div className="pb-6 border-b border-accent/20">
                <h4 className="font-sans text-xs tracking-widest text-accent uppercase mb-4">Mission</h4>
                <p className="font-sans text-primary-foreground/90 text-sm leading-relaxed">
                  To create timeless, high-quality streetwear that empowers individuality and never fades in style or identity.
                </p>
              </div>
              <div className="pb-6 border-b border-accent/20">
                <h4 className="font-sans text-xs tracking-widest text-accent uppercase mb-4">Vision</h4>
                <p className="font-sans text-primary-foreground/90 text-sm leading-relaxed">
                  To build a globally recognized streetwear brand known for premium quality, minimal aesthetics, and a strong emotional connection with its community.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
