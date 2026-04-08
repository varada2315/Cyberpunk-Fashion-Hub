import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-24 md:py-32 bg-background w-full">
      <div className="container px-6 md:px-12 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
          
          {/* Left Column */}
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-heading text-6xl md:text-7xl leading-[0.9] text-foreground mb-8">
              WE DON'T DO<br />FAST FASHION.
            </h2>
            <p className="font-sans text-foreground/80 text-base md:text-lg leading-[1.8] max-w-lg">
              NevrFade was created with one vision — build something that doesn't fade with time. Not just clothing, but identity. In a world of fast fashion, we focus on quality, minimal design, and meaning. Every piece represents confidence, individuality, and a mindset that stays strong.
            </p>
          </motion.div>

          {/* Right Column */}
          <div className="flex flex-col gap-12">
            {[
              { num: "01", text: "Premium Fabric" },
              { num: "02", text: "Minimal Design" },
              { num: "03", text: "Timeless Identity" }
            ].map((item, index) => (
              <motion.div 
                key={item.num}
                initial={{ x: 40, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="flex flex-col gap-2 pb-6 border-b border-accent/30"
              >
                <span className="font-sans text-accent text-sm font-medium tracking-widest">{item.num}</span>
                <h3 className="font-heading text-3xl text-foreground tracking-wide">{item.text}</h3>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
