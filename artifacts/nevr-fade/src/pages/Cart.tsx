import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/hooks/useCart";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [isCheckout, setIsCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiry: "",
    cvv: ""
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would submit to a backend API
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          ...checkoutForm
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert("Order placed successfully! Thank you for your purchase.");
        clearCart();
        setIsCheckout(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || error.message || 'Failed to process order'}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process order. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    placeholder="John Doe"
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
                    placeholder="john@example.com"
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
                    placeholder="123 Main Street"
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
                      placeholder="New York"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={checkoutForm.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                      placeholder="10001"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="font-heading text-2xl text-foreground mb-6">Payment Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={checkoutForm.cardNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Expiry Date</label>
                    <input
                      type="text"
                      name="expiry"
                      value={checkoutForm.expiry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={checkoutForm.cvv}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
                
                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 rounded-full text-lg font-medium tracking-wide uppercase transition-colors bg-[#F5F0EB] text-[#0D0D0D] hover:bg-[#C8B89A]"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </form>
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
                    <p className="font-heading text-lg text-foreground mt-2">${product.price.toFixed(2)} each</p>
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
                      ${(product.price * quantity).toFixed(2)}
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
                <span className="font-heading">${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-heading">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-heading">${(getTotalPrice() * 0.08).toFixed(2)}</span>
              </div>
              <div className="border-t border-primary/30 pt-4 flex justify-between">
                <span className="font-heading text-lg text-foreground">Total</span>
                <span className="font-heading text-lg text-foreground">
                  ${(getTotalPrice() * 1.08).toFixed(2)}
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
