import { motion } from "framer-motion";
import { Link } from "wouter";
import heroBg from "../file_00000000fc4c7206beedabdbce646609.png";

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden flex items-end justify-center pb-24 md:pb-32">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-top bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Dark gradient overlay — keeps text sharp and premium */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D]/30 via-[#0D0D0D]/10 to-[#0D0D0D]/45" />
      {/* Noise texture overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
        opacity: 0.12
      }} />
      
      <div className="container relative z-10 px-6 md:px-12 flex flex-col items-center text-center">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        >
          <Link
            href="/products"
            className="px-10 py-4 rounded-full font-sans font-medium uppercase tracking-widest transition-all duration-300"
            style={{ backgroundColor: '#F5F0EB', color: '#0D0D0D', border: '1px solid #F5F0EB', display: 'inline-block' }}
          >
            Shop Now
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <Link
            href="/products"
            className="mt-4 px-10 py-4 rounded-full font-sans font-medium uppercase tracking-widest transition-all duration-300 border border-primary-foreground"
            style={{ backgroundColor: 'transparent', color: '#F5F0EB', border: '1px solid #F5F0EB', display: 'inline-block' }}
          >
            View Products
          </Link>
        </motion.div>
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
