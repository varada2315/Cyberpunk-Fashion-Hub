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
            setIsPaymentSuccess(true);
            clearCart();
            setIsCheckout(false);
            
            // Redirect to WhatsApp after 3 seconds
            setTimeout(() => {
              const phoneNumber = "+916005613616"; // Remove spaces and + for URL
              const message = `Hello, I've successfully made a payment for my order. Please proceed with the delivery.`;
              const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }, 3000);
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

  if (cartItems.length === 0) {
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

  if (isCheckout) {
   return (
     <main className="min-h-screen bg-background w-full overflow-hidden">
       <Navbar />
       <div className="container mx-auto px-6 md:px-12 py-16">
         <h1 className="font-heading text-4xl text-foreground mb-8">Checkout</h1>
         
         {isPaymentSuccess ? (
           <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
               </svg>
             </div>
             <h3 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h3>
             <p className="text-green-700 mb-6">Thank you for your purchase. Your order has been confirmed.</p>
             <p className="text-sm text-green-600 mb-6">You will be redirected to WhatsApp in 3 seconds...</p>
             <button
               onClick={() => {
                 const phoneNumber = "+916005613616";
                 const message = `Hello, I've successfully made a payment for my order. Please proceed with the delivery.`;
                 const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                 window.open(whatsappUrl, '_blank');
               }}
               className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
             >
               Open WhatsApp Now
             </button>
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
