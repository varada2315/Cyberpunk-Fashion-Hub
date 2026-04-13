import { useParams } from "wouter";
import { fetchProduct } from "@/lib/products";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/currency";
import { findFirstAvailableVariant, getVariantStock } from "@/lib/stock";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addToCart } = useCart();
  const selectedVariantStock = getVariantStock(product, selectedColor, selectedSize);
  const isOutOfStock = selectedVariantStock !== null && selectedVariantStock <= 0;
  const canAddToCart = Boolean(selectedColor && selectedSize) && !isOutOfStock;

  const handleAddToCart = (item: any) => {
    if (!canAddToCart) return;

    const addedToCart = addToCart({
      ...item,
      selectedColor,
      selectedSize,
    });
    if (!addedToCart) return;

    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        try {
          const fetchedProduct = await fetchProduct(parseInt(id, 10));
          setProduct(fetchedProduct);
        } catch (error) {
          console.error("Failed to load product:", error);
          setProduct(null);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;

    const availableVariant = findFirstAvailableVariant(product);
    if (availableVariant) {
      setSelectedColor(availableVariant.color);
      setSelectedSize(availableVariant.size);
      return;
    }

    setSelectedColor(product.colors?.[0] ?? null);
    setSelectedSize(product.sizes?.[0] ?? null);
  }, [product]);

  useEffect(() => {
    if (!product || !selectedColor || !Array.isArray(product.sizes) || product.sizes.length === 0) return;

    const activeSizeIsAvailable =
      selectedSize && (getVariantStock(product, selectedColor, selectedSize) ?? 1) > 0;
    if (activeSizeIsAvailable) return;

    const firstAvailableSizeForColor =
      product.sizes.find((size: string) => (getVariantStock(product, selectedColor, size) ?? 1) > 0) ??
      product.sizes[0] ??
      null;
    if (firstAvailableSizeForColor !== selectedSize) {
      setSelectedSize(firstAvailableSizeForColor);
    }
  }, [product, selectedColor, selectedSize]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background w-full overflow-hidden">
        <Navbar />
        <div className="container mx-auto px-6 md:px-12 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl text-foreground mb-4">Product Not Found</h1>
          <p className="font-sans text-muted-foreground">The product you're looking for doesn't exist.</p>
        </div>
      </div>
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
          className="mb-12 flex flex-col items-center text-center"
        >
          <h1 className="font-heading text-4xl md:text-5xl text-foreground mb-4">{product.title}</h1>
          <p className="font-sans text-sm tracking-widest text-muted-foreground uppercase">{product.category}</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Product Image */}
          <motion.div 
            initial={{ x: -40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-[#1a1a1a] rounded-lg">
              <img 
                src={product.image} 
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div 
            initial={{ x: 40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="mb-8">
              <p className="font-sans text-lg text-muted-foreground mb-6">{product.description}</p>
              
              <div className="flex items-center mb-8">
                <span className="font-heading text-3xl text-foreground">{formatINR(product.price)}</span>
              </div>

               <div className="flex gap-4 mt-6">
                 <button 
                    type="button"
                    disabled={!canAddToCart}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="relative z-10 pointer-events-auto px-8 py-4 rounded-full text-lg font-medium tracking-wide uppercase transition-colors bg-[#F5F0EB] text-[#0D0D0D] hover:bg-[#C8B89A] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isOutOfStock ? "Out of Stock" : added ? "Added" : "Add to Cart"}
                  </button>
                 <button className="px-8 py-4 rounded-full text-lg font-medium tracking-wide uppercase transition-colors border border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                   Buy Now
                 </button>
               </div>

               <div className="mb-8">
                 <h3 className="font-heading text-xl text-foreground mb-4">Colors</h3>
                 <div className="flex gap-3">
                   {product.colors.map((color: string, index: number) => (
                     <button
                       type="button"
                       key={index} 
                       onClick={() => setSelectedColor(color)}
                       aria-label={`Select color ${color}`}
                       aria-pressed={selectedColor === color}
                       className={`w-8 h-8 rounded-full transition-all ${
                         selectedColor === color
                           ? "border-2 border-foreground ring-2 ring-primary/40"
                           : "border border-primary/30"
                       }`}
                       style={{ backgroundColor: color.toLowerCase() }}
                       title={color}
                     />
                   ))}
                 </div>
                 {selectedColor && (
                   <p className="mt-3 text-sm text-muted-foreground">Selected: {selectedColor}</p>
                 )}
               </div>

               <div className="mb-8">
                 <h3 className="font-heading text-xl text-foreground mb-4">Sizes</h3>
                 <div className="flex flex-wrap gap-3">
                   {product.sizes.map((size: string, index: number) => (
                     (() => {
                       const sizeStock = getVariantStock(product, selectedColor, size);
                       const sizeOutOfStock = sizeStock !== null && sizeStock <= 0;

                       return (
                      <button
                        type="button"
                        key={index} 
                        disabled={sizeOutOfStock}
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={selectedSize === size}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedSize === size
                            ? "bg-primary text-primary-foreground border border-primary"
                            : "border border-primary/30 hover:border-primary/60"
                        }`}
                      >
                        {size}
                        {sizeStock !== null ? ` (${sizeStock})` : ""}
                      </button>
                       );
                     })()
                   ))}
                 </div>
                 {selectedSize && (
                   <p className="mt-3 text-sm text-muted-foreground">Selected: {selectedSize}</p>
                 )}
                 {selectedVariantStock !== null && (
                   <p className={`mt-2 text-sm ${isOutOfStock ? "text-red-500" : "text-muted-foreground"}`}>
                     Stock for selected variant: {selectedVariantStock}
                   </p>
                 )}
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
