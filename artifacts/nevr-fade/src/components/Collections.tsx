import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Collections() {
  const products = [
    {
      id: 9,
      image: "/IMG_1728.PNG",
      title: "LIMITED DROP COLLECTION",
      category: "SEASON 01",
      hasProduct: true
    },
    {
      id: 10,
      image: "/IMG_1791.PNG",
      title: "PREMIUM BOXY FIT T-SHIRTS",
      category: "EVERYDAY ESSENTIAL",
      hasProduct: true
    }
  ];

  return (
    <section id="collections" className="py-24 md:py-32 bg-secondary w-full">
      <div className="container px-6 md:px-12 mx-auto">
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24 flex flex-col items-center text-center"
        >
          <h2 className="font-heading text-5xl md:text-6xl text-foreground mb-4">LIMITED DROPS</h2>
          <p className="font-sans text-sm tracking-widest text-muted-foreground uppercase">Not mass produced. Never repeated.</p>
          <div className="mt-8">
            <a href="/products" className="px-6 py-3 rounded-full text-sm font-medium tracking-wide uppercase transition-colors bg-[#F5F0EB] text-[#0D0D0D] hover:bg-[#C8B89A]">
              View All Products
            </a>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-4xl mx-auto">
          {products.map((product, index) => {
            const CardContent = (
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`flex flex-col transition-transform duration-500 ease-out ${
                  product.hasProduct ? "group cursor-pointer hover:-translate-y-2" : "cursor-default"
                }`}
              >
                <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-[#1a1a1a]">
                  <img
                    src={product.image}
                    alt={product.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      product.hasProduct ? "group-hover:scale-105" : ""
                    }`}
                  />
                </div>
                <div className={`flex flex-col gap-2 pb-4 border-b-2 border-transparent transition-colors duration-300 ${
                  product.hasProduct ? "group-hover:border-accent" : ""
                }`}>
                  <span className="font-sans text-xs tracking-widest text-muted-foreground">{product.category}</span>
                  <h3 className="font-heading text-2xl tracking-wide text-foreground">{product.title}</h3>
                  {product.hasProduct && (
                    <span className="font-sans text-sm mt-2 flex items-center gap-2 text-foreground font-medium">
                      Explore <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </span>
                  )}
                </div>
              </motion.div>
            );

            return product.hasProduct ? (
              <Link key={product.id} href={`/product/${product.id}`} className="block">
                {CardContent}
              </Link>
            ) : (
              <div key={product.id} className="block">
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
