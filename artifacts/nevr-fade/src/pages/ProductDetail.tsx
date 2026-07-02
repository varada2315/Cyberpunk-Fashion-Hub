import { useParams } from "wouter";
import { fetchProduct, Review, fetchProductReviews, createProductReview } from "@/lib/products";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/currency";
import { findFirstAvailableVariant, getVariantStock } from "@/lib/stock";
import { ChevronLeft, ChevronRight, Ruler, Star, MessageSquare, PlusCircle } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!product) return;
    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const data = await fetchProductReviews(product.id);
        setReviews(data);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, [product]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!newReviewName.trim() || newReviewRating < 1 || newReviewRating > 5) {
      toast.error("Please enter your name and select a rating.");
      return;
    }

    setSubmittingReview(true);
    try {
      const created = await createProductReview(product.id, {
        authorName: newReviewName.trim(),
        rating: newReviewRating,
        comment: newReviewComment.trim()
      });
      toast.success("Thank you for your feedback! Review added.");
      setReviews(prev => [created, ...prev]);
      setNewReviewName("");
      setNewReviewRating(5);
      setNewReviewComment("");
      setShowReviewForm(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const { addToCart } = useCart();
  const selectedVariantStock = getVariantStock(product, selectedColor, selectedSize);
  const isOutOfStock = selectedVariantStock !== null && selectedVariantStock <= 0;
  const canAddToCart = Boolean(selectedColor && selectedSize) && !isOutOfStock;

  const getFilteredImages = (images: string[], color: string | null) => {
    if (!images || !Array.isArray(images)) return [];
    if (!color) return images;

    // Check colorImages map from DB
    let colorImgMap: Record<string, string[]> = {};
    if (product?.colorImages) {
      try {
        colorImgMap = typeof product.colorImages === 'string'
          ? JSON.parse(product.colorImages)
          : product.colorImages;
      } catch (e) {
        console.error("Error parsing product.colorImages in ProductDetail:", e);
      }
    }

    if (colorImgMap[color] && colorImgMap[color].length > 0) {
      return colorImgMap[color];
    }

    // Fallbacks for default/legacy static mock colors
    const normalizedColor = color.toLowerCase();
    if (normalizedColor === '#faf9f6' || normalizedColor === 'off-white' || normalizedColor === 'off white') {
      const offWhiteFiltered = images.filter(img =>
        img.includes('1730') || img.includes('1732') || img.includes('1733') ||
        img.includes('1738') || img.includes('1742') || img.includes('1753') ||
        img.includes('1791') || img.includes('1794') || img.includes('1796') ||
        img.includes('1797') || img.includes('1798') || img.includes('1811') ||
        img.includes('1813')
      );
      if (offWhiteFiltered.length > 0) return offWhiteFiltered;
    }
    if (normalizedColor === '#000000' || normalizedColor === 'black') {
      const blackFiltered = images.filter(img =>
        img.includes('1728') || img.includes('1745') || img.includes('1748') ||
        img.includes('1749') || img.includes('1754') || img.includes('1755') ||
        img.includes('1760') || img.includes('1764') ||
        img.includes('1767') || img.includes('1770') || img.includes('1771') ||
        img.includes('1804') || img.includes('1805') || img.includes('1809')
      );
      if (blackFiltered.length > 0) return blackFiltered;
    }
    return images;
  };

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

  const filteredImages = getFilteredImages(product?.images, selectedColor);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && Array.isArray(filteredImages) && filteredImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % filteredImages.length);
    } else if (isRightSwipe && Array.isArray(filteredImages) && filteredImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
    }
  };

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
    setCurrentImageIndex(0);
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

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

  // Auto swipe removed in favor of manual swipes and clicks to view products

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
      <div className="container mx-auto px-6 md:px-12 py-16 pt-36">
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
            className="w-full lg:w-1/2 flex flex-col gap-4"
          >
            <div 
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              className="relative aspect-[3/4] overflow-hidden bg-[#1a1a1a] rounded-lg group/slider"
            >
              {Array.isArray(filteredImages) && filteredImages.length > 0 ? (
                filteredImages.map((imgUrl: string, idx: number) => (
                  <img
                    key={imgUrl}
                    src={imgUrl}
                    alt={`${product.title} - view ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${idx === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                      } ${isOutOfStock ? "opacity-40 grayscale" : ""}`}
                  />
                ))
              ) : (
                <img
                  src={product.image || "/placeholder.png"}
                  alt={product.title}
                  className={`w-full h-full object-cover ${isOutOfStock ? "opacity-40 grayscale" : ""}`}
                />
              )}

              {/* Prev / Next buttons */}
              {Array.isArray(filteredImages) && filteredImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full border border-white/10 transition-colors opacity-0 group-hover/slider:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % filteredImages.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full border border-white/10 transition-colors opacity-0 group-hover/slider:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  <div className="bg-black/80 text-white px-8 py-4 border border-white/20 backdrop-blur-sm rounded-sm">
                    <span className="font-heading text-xl tracking-[0.2em] uppercase">Sold Out</span>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {Array.isArray(filteredImages) && filteredImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {filteredImages.map((imgUrl: string, idx: number) => (
                  <button
                    type="button"
                    key={imgUrl}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 aspect-[3/4] overflow-hidden rounded-md border-2 bg-[#1a1a1a] flex-shrink-0 transition-all ${idx === currentImageIndex
                        ? "border-primary opacity-100 scale-95"
                        : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="flex flex-col gap-12">
              {/* Product Info Block (Price, Colors, Sizes, Buttons) */}
              <div className="flex flex-col gap-8">
                <div>
                  <div className="flex items-center">
                    <span className="font-heading text-3xl text-foreground">{formatINR(product.price)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-xl text-foreground mb-4">Colors</h3>
                  <div className="flex gap-3">
                    {product.colors.map((color: string, index: number) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select color ${color}`}
                        aria-pressed={selectedColor === color}
                        className={`w-8 h-8 rounded-full transition-all ${selectedColor === color
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

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-heading text-xl text-foreground">Sizes</h3>
                    <button
                      type="button"
                      onClick={() => setShowSizeChart(true)}
                      className="text-sm font-sans font-medium text-accent hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Ruler className="w-4 h-4" /> View Size Guide
                    </button>
                  </div>
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
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedSize === size
                                ? "bg-primary text-primary-foreground border border-primary"
                                : "border border-primary/30 hover:border-primary/60"
                              }`}
                          >
                            {size}
                          </button>
                        );
                      })()
                    ))}
                  </div>
                  {selectedSize && (
                    <p className="mt-3 text-sm text-muted-foreground">Selected: {selectedSize}</p>
                  )}
                  {isOutOfStock && (
                    <p className="mt-2 text-sm text-red-500 font-semibold uppercase tracking-wider">
                      Out of Stock
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
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
                  <button
                    type="button"
                    disabled={!canAddToCart}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      // Buy Now logic: Add to cart and redirect
                      if (canAddToCart) {
                        handleAddToCart(product);
                        window.location.href = '/cart';
                      }
                    }}
                    className="px-8 py-4 rounded-full text-lg font-medium tracking-wide uppercase transition-colors border border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Product Description Block (About the Product) */}
              <div>
                <p className="font-sans text-lg text-muted-foreground">{product.description}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-24 border-t border-primary/10 pt-16 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl text-foreground uppercase tracking-wider mb-2">Customer Feedback</h2>
              <div className="flex items-center gap-3">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const avg = reviews.length > 0 
                      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
                      : 0;
                    return (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.round(avg) ? "fill-amber-500 text-amber-500" : "text-primary/20"}`}
                      />
                    );
                  })}
                </div>
                <span className="text-sm font-sans font-medium text-muted-foreground">
                  {reviews.length > 0
                    ? `${(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} out of 5 (${reviews.length} reviews)`
                    : "No reviews yet"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-heading uppercase text-xs tracking-wider rounded-full px-6 py-3.5 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              {showReviewForm ? "Cancel" : "Write a Review"}
            </button>
          </div>

          {/* Add Review Form */}
          {showReviewForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-12"
            >
              <form onSubmit={handleReviewSubmit} className="bg-secondary p-6 sm:p-8 rounded-lg border border-primary/20 space-y-6">
                <h3 className="font-heading text-lg text-foreground uppercase tracking-wider">Share Your Thoughts</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] block">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. NeonRider"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="w-full bg-background border border-primary/20 rounded-full px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] block">Rating</label>
                    <div className="flex items-center gap-2 pt-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starVal = i + 1;
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setNewReviewRating(starVal)}
                            className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 ${starVal <= newReviewRating ? "fill-amber-500 text-amber-500" : "text-primary/20"}`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] block">Review Details</label>
                  <textarea
                    placeholder="Tell us about the fabric, fit, and style..."
                    rows={4}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    className="w-full bg-background border border-primary/20 rounded-2xl px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-3 rounded-full text-xs font-heading uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-primary text-primary-foreground font-heading uppercase text-xs tracking-wider rounded-full px-6 py-3 hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviewsLoading ? (
              <div className="text-center py-12 text-muted-foreground font-sans text-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 bg-secondary/50 rounded-lg border border-dashed border-primary/20 text-muted-foreground font-sans">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold uppercase tracking-wider">No reviews yet</p>
                <p className="text-xs text-muted-foreground mt-1">Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="p-6 bg-secondary rounded-lg border border-primary/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-heading text-sm text-foreground">{review.authorName}</span>
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-500 text-amber-500" : "text-primary/10"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-sans">
                      {new Date(review.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground font-sans leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showSizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] border border-[#333333] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 text-white relative shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowSizeChart(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-3xl font-sans leading-none cursor-pointer"
            >
              &times;
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="font-heading text-3xl text-[#C8B89A] tracking-wider mb-1">NEVRFADE</h2>
              <h3 className="font-heading text-xl text-white tracking-wide uppercase mb-1">SIZE CHART</h3>
              <p className="text-xs text-zinc-400 uppercase tracking-widest font-sans font-semibold">Boxy Fit T-Shirt — Structured. Modern. Made to Last.</p>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Size Table */}
              <div>
                <table className="w-full text-left border-collapse font-sans text-sm">
                  <thead>
                    <tr className="border-b border-[#333333] text-[#C8B89A] font-heading uppercase tracking-wider text-xs">
                      <th className="py-3 px-2">Size</th>
                      <th className="py-3 px-2">Width (in)</th>
                      <th className="py-3 px-2">Length (in)</th>
                      <th className="py-3 px-2">Sleeve (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { s: 'S', w: '22', l: '25.5', sl: '9.5' },
                      { s: 'M', w: '23', l: '26.5', sl: '9.5' },
                      { s: 'L', w: '24', l: '27', sl: '10.2' },
                      { s: 'XL', w: '24.5', l: '28', sl: '10.2' },
                    ].map((row) => (
                      <tr 
                        key={row.s}
                        onClick={() => {
                          if (product.sizes.includes(row.s)) {
                            setSelectedSize(row.s);
                            setShowSizeChart(false);
                          }
                        }}
                        className={`border-b border-[#222222] hover:bg-[#C8B89A]/15 cursor-pointer transition-colors ${
                          !product.sizes.includes(row.s) ? 'opacity-40 cursor-not-allowed' : ''
                        } ${selectedSize === row.s ? 'bg-[#C8B89A]/10 text-[#C8B89A] font-semibold' : ''}`}
                      >
                        <td className="py-3 px-2 font-bold font-heading">{row.s}</td>
                        <td className="py-3 px-2">{row.w}</td>
                        <td className="py-3 px-2">{row.l}</td>
                        <td className="py-3 px-2">{row.sl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[11px] text-zinc-400 mt-4 italic">
                  ⓘ All measurements may vary by ±0.5 inch. Click a row to select that size.
                </p>
              </div>

              {/* How to Measure / Fit Guide */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-heading text-xs text-[#C8B89A] uppercase tracking-wider mb-3">How To Measure</h4>
                  <div className="space-y-3 font-sans text-xs text-zinc-300">
                    <div>
                      <strong className="text-white block mb-0.5 text-[11px] uppercase tracking-wide">LENGTH</strong>
                      Measure from the highest point of the shoulder to the bottom hem.
                    </div>
                    <div>
                      <strong className="text-white block mb-0.5 text-[11px] uppercase tracking-wide">WIDTH</strong>
                      Measure across the chest from armpit to armpit.
                    </div>
                    <div>
                      <strong className="text-white block mb-0.5 text-[11px] uppercase tracking-wide">SLEEVE</strong>
                      Measure from the shoulder seam to the end of the sleeve.
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#222222] pt-4">
                  <h4 className="font-heading text-xs text-[#C8B89A] uppercase tracking-wider mb-3">Fit Guide</h4>
                  <div className="bg-[#181818] p-3.5 rounded border border-[#222222] text-xs space-y-3 font-sans">
                    <div>
                      <strong className="text-[#C8B89A] uppercase tracking-wider text-[10px] block font-semibold mb-1">Boxy Fit</strong>
                      <ul className="list-disc list-inside text-zinc-400 space-y-0.5 pl-1">
                        <li>Wider body</li>
                        <li>Straight cut</li>
                        <li>Slightly cropped length</li>
                        <li>Structured look</li>
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-[#222222]">
                      <strong className="text-zinc-400 uppercase tracking-wider text-[10px] block font-semibold mb-1">Oversized Fit</strong>
                      <ul className="list-disc list-inside text-zinc-500 space-y-0.5 pl-1">
                        <li>Extra loose</li>
                        <li>Dropped shoulders</li>
                        <li>Longer length</li>
                        <li>More relaxed drape</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowSizeChart(false)}
                className="px-6 py-2 rounded-full font-sans text-xs font-semibold uppercase bg-zinc-800 text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}
