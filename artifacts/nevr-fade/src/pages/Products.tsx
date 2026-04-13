import { Link } from "wouter";
import { fetchProducts } from "@/lib/products";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/currency";
import { findFirstAvailableVariant, getTotalVariantStock } from "@/lib/stock";
import { useAdminContext } from "@/hooks/useAdminContext";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const { addToCart } = useCart();
  const { products: adminProducts, fetchProducts: fetchAdminProducts } = useAdminContext();

  const handleAddToCart = (product: any) => {
    const variant = findFirstAvailableVariant(product);
    const added = addToCart({
      ...product,
      selectedColor: variant?.color ?? product.colors?.[0] ?? null,
      selectedSize: variant?.size ?? product.sizes?.[0] ?? null,
    });
    if (!added) return;

    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current));
    }, 1200);
  };
  
  const handleBuyNow = (product: any) => {
    const variant = findFirstAvailableVariant(product);
    addToCart({
      ...product,
      selectedColor: variant?.color ?? product.colors?.[0] ?? null,
      selectedSize: variant?.size ?? product.sizes?.[0] ?? null,
    });
    
    // Redirect to cart page for checkout
    window.location.href = '/cart';
  };
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        // First try to fetch from admin context if available
        // If not, fall back to public API
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);
  
  if (loading) {
    return (
      <main className="min-h-screen bg-background w-full overflow-hidden">
        <Navbar />
        <div className="container mx-auto px-6 md:px-12 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-background w-full overflow-hidden">
      <Navbar />
      <div className="container mx-auto px-6 md:px-12 py-16 pt-24">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16 md:mb-24 flex flex-col items-center text-center"
        >
          <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-4">Our Products</h1>
          <p className="font-sans text-sm tracking-widest text-muted-foreground uppercase">Discover our premium collection</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {products.map((product, index) => {
            const totalStock = getTotalVariantStock(product);
            const outOfStock = totalStock !== null && totalStock <= 0;

            return (
              <motion.div
                key={product.id}
                initial={{ y: 60, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group cursor-pointer flex flex-col transition-transform duration-500 ease-out hover:-translate-y-2"
              >
                <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-[#1a1a1a]">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-2 pb-4 border-b-2 border-transparent transition-colors duration-300 group-hover:border-accent">
                  <span className="font-sans text-xs tracking-widest text-muted-foreground">{product.category}</span>
                  <h3 className="font-heading text-2xl tracking-wide text-foreground">{product.title}</h3>
                  <p className="font-sans text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-heading text-lg text-foreground">{formatINR(product.price)}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleAddToCart(product);
                        }}
                        className="relative z-10 pointer-events-auto px-4 py-2 rounded-full text-sm font-medium tracking-wide uppercase transition-colors bg-[#F5F0EB] text-[#0D0D0D] hover:bg-[#C8B89A] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {outOfStock ? "Out of Stock" : addedProductId === product.id ? "Added" : "Add to Cart"}
                      </button>
                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleBuyNow(product);
                        }}
                        className="relative z-10 pointer-events-auto px-4 py-2 rounded-full text-sm font-medium tracking-wide uppercase transition-colors bg-[#0D0D0D] text-[#F5F0EB] hover:bg-[#C8B89A] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Buy Now
                      </button>
                      <Link href={`/product/${product.id}`}>
                        <button className="px-4 py-2 rounded-full text-sm font-medium tracking-wide uppercase transition-colors bg-[#0D0D0D] text-[#F5F0EB] hover:bg-[#C8B89A]">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
