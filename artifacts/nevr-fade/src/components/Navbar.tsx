import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useCart } from "@/hooks/useCart";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const logoSrc = "/Never fade in bold contrast.png";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Story", href: "#story" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 bg-black text-white border-b border-[#333333] py-4`}
      >
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="z-50 relative w-20 md:w-24 h-12 md:h-14 overflow-visible">
            <Link href="/" className="block w-full h-full overflow-visible">
              <img
                src={logoSrc}
                alt="NevrFade logo"
                className="h-12 md:h-14 w-auto max-w-none object-contain origin-left scale-[3]"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 items-center font-sans text-sm tracking-wide uppercase">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="hover:text-accent transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex gap-4 items-center">
            <Link href="/products" className="px-6 py-2 rounded-full text-sm font-medium tracking-wide uppercase transition-colors bg-white text-black hover:bg-[#C8B89A] hover:text-white">
              Shop Now
            </Link>
            <Link href="/cart" className="relative px-6 py-2 rounded-full text-sm font-medium tracking-wide uppercase transition-colors bg-white text-black hover:bg-[#C8B89A] hover:text-white">
              Cart
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden z-50 relative"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-primary flex flex-col justify-center items-center"
          >
            <nav className="flex flex-col gap-8 text-center">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-4xl font-heading text-primary-foreground tracking-widest hover:text-accent transition-colors"
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 px-8 py-3 bg-primary-foreground text-primary rounded-full font-sans uppercase tracking-widest"
              >
                <Link href="/products" onClick={() => setMobileMenuOpen(false)}>
                  Shop Now
                </Link>
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 px-8 py-3 bg-primary-foreground text-primary rounded-full font-sans uppercase tracking-widest"
              >
                <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
                  Cart
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
