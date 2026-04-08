import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-screen w-full bg-primary overflow-hidden flex items-center justify-center">
      {/* Noise overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
        opacity: 0.15
      }} />
      
      <div className="container relative z-10 px-6 md:px-12 flex flex-col items-center text-center">
        <motion.h1 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-primary-foreground font-heading text-6xl md:text-8xl lg:text-[110px] tracking-wide leading-none mb-6 max-w-5xl"
        >
          NEVRFADE — BUILT DIFFERENT
        </motion.h1>
        
        <motion.p 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-[#C8B89A] font-sans text-lg md:text-xl max-w-2xl mb-12"
        >
          Premium streetwear designed to last — in style, quality, and identity.
        </motion.p>
        
        <motion.button
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="px-10 py-4 rounded-full font-sans font-medium uppercase tracking-widest transition-all duration-300"
          style={{ backgroundColor: '#F5F0EB', color: '#0D0D0D', border: '1px solid #F5F0EB' }}
        >
          Shop Now
        </motion.button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
      >
        <div className="w-[1px] h-16 bg-primary-foreground/30 relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 64] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-full h-1/2 bg-primary-foreground absolute top-0"
          />
        </div>
      </motion.div>
    </section>
  );
}
