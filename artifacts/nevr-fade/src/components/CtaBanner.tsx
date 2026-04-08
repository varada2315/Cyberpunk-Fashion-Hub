import { motion } from "framer-motion";

export default function CtaBanner() {
  return (
    <section className="py-24 md:py-32 bg-accent w-full text-center flex flex-col items-center justify-center">
      <div className="container px-6 mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="font-heading text-7xl md:text-[100px] leading-none text-primary mb-10 tracking-wider"
        >
          NEVER SETTLE.
        </motion.h2>
        
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-sans font-medium uppercase tracking-widest hover:bg-transparent hover:text-primary hover:border hover:border-primary transition-all duration-300 flex items-center gap-3 mx-auto group"
        >
          Shop the latest drop 
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </motion.button>
      </div>
    </section>
  );
}
