import { Link } from "wouter";
import { fetchProducts } from "@/lib/products";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/currency";
import { getTotalVariantStock, findFirstAvailableVariant } from "@/lib/stock";

function ProductImageSlideshow({ images, title, outOfStock }: { images: string[], title: string, outOfStock: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [images]);

  const displayImages = Array.isArray(images) && images.length > 0 ? images : [];

  if (displayImages.length === 0) {
    return <div className="w-full h-full bg-[#1a1a1a]" />;
  }

  return (
    <div className="relative w-full h-full overflow-hidden transition-transform duration-700 group-hover:scale-105">
      {displayImages.map((imgUrl, index) => (
        <img
          key={imgUrl}
          src={imgUrl}
          alt={`${title} - image ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          } ${outOfStock ? "opacity-40 grayscale" : ""}`}
        />
      ))}
      {displayImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
          {displayImages.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-white scale-125" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const { addToCart } = useCart();

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
        const fetchedProducts = await fetchProducts();
        if (Array.isArray(fetchedProducts)) {
          setProducts(fetchedProducts);
        } else {
          console.error("API did not return an array:", fetchedProducts);
          setProducts([]);
        }
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
      <div className="container mx-auto px-6 md:px-12 py-16 pt-36">
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
                className="group cursor-pointer flex flex-col h-full bg-secondary/30 border border-primary/10 hover:border-primary/30 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,240,235,0.02)]"
              >
                {/* Image Section */}
                <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-[#1a1a1a]">
                  <ProductImageSlideshow
                    images={product.images}
                    title={product.title}
                    outOfStock={outOfStock}
                  />
                  {outOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
                      <div className="bg-black/90 text-white px-6 py-3 border border-white/20 backdrop-blur-sm rounded-sm">
                        <span className="font-heading text-lg tracking-widest uppercase">Sold Out</span>
                      </div>
                    </div>
                  )}
                </Link>

                {/* Details Section */}
                <div className="flex flex-col flex-grow p-6 gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <span className="font-sans text-xs tracking-widest text-muted-foreground uppercase">{product.category}</span>
                    <span className="font-heading text-lg text-primary">{formatINR(product.price)}</span>
                  </div>
                  <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors block">
                    <h3 className={`font-heading text-2xl tracking-wide ${outOfStock ? "text-muted-foreground" : "text-foreground"}`}>
                      {product.title}
                    </h3>
                  </Link>
                  <p className="font-sans text-sm text-muted-foreground mt-2 line-clamp-2 flex-grow">{product.description}</p>
                  
                  {/* Actions Section */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-primary/10">
                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="flex-1 px-4 py-3 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-300 bg-[#F5F0EB] text-[#0D0D0D] hover:bg-[#C8B89A] disabled:opacity-50 disabled:cursor-not-allowed text-center"
                    >
                      {outOfStock ? "Sold Out" : addedProductId === product.id ? "Added" : "Add to Cart"}
                    </button>
                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        handleBuyNow(product);
                      }}
                      className="flex-1 px-4 py-3 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-300 bg-[#0D0D0D] text-[#F5F0EB] border border-[#F5F0EB]/20 hover:bg-[#F5F0EB]/10 disabled:opacity-50 disabled:cursor-not-allowed text-center"
                    >
                      Buy Now
                    </button>
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
