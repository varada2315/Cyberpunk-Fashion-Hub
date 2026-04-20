import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/currency";
import { getVariantStock } from "@/lib/stock";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [isCheckout, setIsCheckout] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
    country: "India",
    state: ""
  });
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First, create a Razorpay order
    try {
      const totalAmount = getTotalPrice() * 1.08; // Including 8% tax
      
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalAmount,
          receipt: `order_${Date.now()}`
        })
      });
      
      const orderResult = await orderResponse.json();
      
      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }
      
      // Store the order ID for later use
      setRazorpayOrderId(orderResult.order.id);
      
      // Now proceed with the checkout
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          ...checkoutForm,
          orderId: orderResult.order.id
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Initialize Razorpay payment
        const razorpay = new (window as any).Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: Math.round(totalAmount * 100), // Amount in paise
          currency: "INR",
          order_id: orderResult.order.id,
          handler: function (response: any) {
            // Payment successful
            setPurchasedItems([...cartItems]);
            setIsPaymentSuccess(true);
            clearCart();
            setIsCheckout(false);
            
          },
          prefill: {
            name: checkoutForm.name,
            email: checkoutForm.email,
            contact: checkoutForm.phone
          },
          theme: {
            color: "#F5F0EB"
          }
        });
        
        razorpay.open();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || error.message || 'Failed to process order'}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process order. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCheckoutForm(prev => ({ ...prev, [name]: value }));
  };

  if (cartItems.length === 0 && !isPaymentSuccess) {
    return (
      <main className="min-h-screen bg-background w-full overflow-hidden">
        <Navbar />
        <div className="container mx-auto px-6 md:px-12 py-16">
          <div className="text-center p-8 bg-secondary rounded-lg max-w-md">
            <h1 className="font-heading text-3xl text-foreground mb-4">Your Cart is Empty</h1>
            <p className="font-sans text-muted-foreground mb-6">
              Add some products to your cart to get started.
            </p>
            <a href="/products" className="px-6 py-3 rounded-full text-sm font-medium tracking-wide uppercase transition-colors bg-[#F5F0EB] text-[#0D0D0D] hover:bg-[#C8B89A]">
              Browse Products
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (isCheckout || isPaymentSuccess) {
   return (
     <main className="min-h-screen bg-background w-full overflow-hidden">
       <Navbar />
       <div className="container mx-auto px-6 md:px-12 py-16">
         <h1 className="font-heading text-4xl text-foreground mb-8">{isPaymentSuccess ? "Order Confirmed" : "Checkout"}</h1>
         
         {isPaymentSuccess ? (
            <div className="bg-secondary border border-primary/20 rounded-xl p-8 max-w-2xl mx-auto shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-25"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="font-heading text-3xl text-foreground mb-2 text-center">Payment Successful!</h3>
              <p className="font-sans text-muted-foreground mb-8 text-center">Your tactical gear is secured. Order reference: <span className="text-primary font-mono text-sm">{razorpayOrderId}</span></p>
              
              {purchasedItems.length > 0 && (
                <div className="text-left bg-background/50 border border-primary/10 rounded-lg p-6 mb-8">
                  <h4 className="font-heading text-lg text-foreground mb-4 border-b border-primary/20 pb-2">Acquired Items</h4>
                  <div className="space-y-4">
                    {purchasedItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded text-xs text-primary">{item.quantity}x</span>
                          <div>
                            <p className="font-medium text-foreground">{item.product.title}</p>
                            {(item.selectedColor || item.selectedSize) && (
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                {item.selectedColor || 'Default'} // {item.selectedSize || 'Standard'}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-mono text-primary text-xs">{formatINR(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-primary/20 flex justify-between items-center">
                    <span className="font-heading text-lg text-foreground">Total Paid (incl. Tax)</span>
                    <span className="font-heading text-2xl text-primary">{formatINR(purchasedItems.reduce((s, i) => s + (i.product.price * i.quantity), 0) * 1.08)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground mb-4 italic">Confirm your delivery details with our team:</p>
                <button
                  onClick={() => {
                    const phoneNumber = "919103586486";
                    const itemNames = purchasedItems.map(i => `${i.quantity}x ${i.product.title}`).join(', ');
                    const message = `Hello, I've successfully made a payment for Order #${razorpayOrderId}.\n\nItems: ${itemNames}\n\nPlease proceed with delivery to ${checkoutForm.address}, ${checkoutForm.city}.`;
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-lg"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Connect via WhatsApp
                </button>
                <a href="/products" className="block text-accent hover:text-primary transition-colors text-sm font-medium">Continue Shopping</a>
              </div>
            </div>
         ) : (
           <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             <div>
               <h2 className="font-heading text-2xl text-foreground mb-6">Shipping Information</h2>
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
                   <input
                     type="text"
                     name="name"
                     value={checkoutForm.name}
                     onChange={handleInputChange}
                     className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                     required
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                   <input
                     type="email"
                     name="email"
                     value={checkoutForm.email}
                     onChange={handleInputChange}
                     className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                     required
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Number</label>
                   <input
                     type="tel"
                     name="phone"
                     value={checkoutForm.phone}
                     onChange={handleInputChange}
                     className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                     required
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-muted-foreground mb-2">Address</label>
                   <input
                     type="text"
                     name="address"
                     value={checkoutForm.address}
                     onChange={handleInputChange}
                     className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                     required
                   />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-muted-foreground mb-2">City</label>
                     <input
                       type="text"
                       name="city"
                       value={checkoutForm.city}
                       onChange={handleInputChange}
                       className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                       required
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-muted-foreground mb-2">State</label>
                     <input
                       type="text"
                       name="state"
                       value={checkoutForm.state}
                       onChange={handleInputChange}
                       className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                       required
                     />
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-muted-foreground mb-2">ZIP Code</label>
                     <input
                       type="text"
                       name="zipCode"
                       value={checkoutForm.zipCode}
                       onChange={handleInputChange}
                       className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                       required
                     />
                   </div>
                   
                   <div>
                     <label className="block text-sm font-medium text-muted-foreground mb-2">Country</label>
                     <select
                       name="country"
                       value={checkoutForm.country}
                       onChange={handleInputChange}
                       className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                       required
                     >
                       <option value="India">India</option>
                     </select>
                   </div>
                 </div>
               </div>
             </div>
             
             <div>
               <h2 className="font-heading text-2xl text-foreground mb-6">Razorpay Payment</h2>
               <div className="space-y-4">
                 <div className="bg-secondary p-4 rounded-lg">
                   <p className="text-muted-foreground mb-2">You will be redirected to Razorpay to complete your payment securely.</p>
                   <p className="text-sm text-muted-foreground">Total amount: {formatINR(getTotalPrice() * 1.08)}</p>
                 </div>
                 
                 <div className="pt-6">
                   <button
                     type="submit"
                     className="w-full px-6 py-3 rounded-full text-lg font-medium tracking-wide uppercase transition-colors bg-[#F5F0EB] text-[#0D0D0D] hover:bg-[#C8B89A]"
                   >
                     Proceed to Razorpay
                   </button>
                 </div>
               </div>
             </div>
           </form>
         )}
       </div>
     </main>
   );
  }

  return (
    <main className="min-h-screen bg-background w-full overflow-hidden">
      <Navbar />
      <div className="container mx-auto px-6 md:px-12 py-16">
        <h1 className="font-heading text-4xl text-foreground mb-8">Your Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map(({ product, quantity }) => (
                <div key={`${product.id}-${product.selectedColor ?? "default"}-${product.selectedSize ?? "default"}`} className="flex items-center gap-6 p-6 bg-secondary rounded-lg">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-heading text-xl text-foreground">{product.title}</h3>
                    <p className="font-sans text-muted-foreground">{product.category}</p>
                    {(product.selectedColor || product.selectedSize) && (
                      <p className="font-sans text-sm text-muted-foreground mt-1">
                        {product.selectedColor ? `Color: ${product.selectedColor}` : ""}
                        {product.selectedColor && product.selectedSize ? " | " : ""}
                        {product.selectedSize ? `Size: ${product.selectedSize}` : ""}
                      </p>
                    )}
                    <p className="font-heading text-lg text-foreground mt-2">{formatINR(product.price)} each</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() =>
                          updateQuantity(
                            product.id,
                            quantity - 1,
                            product.selectedColor,
                            product.selectedSize
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 text-primary"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{quantity}</span>
                      <button 
                        onClick={() =>
                          updateQuantity(
                            product.id,
                            quantity + 1,
                            product.selectedColor,
                            product.selectedSize
                          )
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 text-primary"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-heading text-lg text-foreground">
                      {formatINR(product.price * quantity)}
                    </span>
                    <button 
                      onClick={() =>
                        removeFromCart(product.id, product.selectedColor, product.selectedSize)
                      }
                      className="ml-4 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-secondary p-8 rounded-lg">
            <h2 className="font-heading text-2xl text-foreground mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-heading">{formatINR(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-heading">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-heading">{formatINR(getTotalPrice() * 0.08)}</span>
              </div>
              <div className="border-t border-primary/30 pt-4 flex justify-between">
                <span className="font-heading text-lg text-foreground">Total</span>
                <span className="font-heading text-lg text-foreground">
                  {formatINR(getTotalPrice() * 1.08)}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setIsCheckout(true)}
              className="w-full px-6 py-3 rounded-full text-lg font-medium tracking-wide uppercase transition-colors bg-[#F5F0EB] text-[#0D0D0D] hover:bg-[#C8B89A] mb-4"
            >
              Proceed to Checkout
            </button>
            
            <a href="/products" className="block text-center text-primary hover:text-accent transition-colors">
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
