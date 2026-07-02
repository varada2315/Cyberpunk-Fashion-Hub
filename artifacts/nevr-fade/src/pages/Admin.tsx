import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAdminContext } from "@/hooks/useAdminContext";
import { formatINR } from "@/lib/currency";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  ShoppingCart, 
  LayoutDashboard, 
  Plus, 
  Minus,
  Trash2, 
  Edit, 
  LogOut, 
  Image as ImageIcon,
  X,
  Upload,
  ChevronRight,
  Save,
  Trash,
  Lock,
  Mail,
  ShieldCheck
} from "lucide-react";

const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];

interface ColorConfig {
  id: string;
  color: string;
  images: string[];
  stock: Record<string, number>;
}

export default function Admin() {
  const {
    isAuthenticated,
    login,
    logout,
    products,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    orders,
    fetchOrders,
    coupons,
    fetchCoupons,
    createCoupon,
    deleteCoupon,
    loading,
    error,
    requestPasswordChangeOtp,
    verifyAndChangePassword
  } = useAdminContext();

  const [activeTab, setActiveTab] = useState("products");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Product Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    name: "",
    category: "",
    description: "",
    price: "",
    images: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    stockByVariant: {} as Record<string, number>
  });

  const [colorConfigs, setColorConfigs] = useState<ColorConfig[]>([
    {
      id: "initial",
      color: "#000000",
      images: [],
      stock: ALL_SIZES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {})
    }
  ]);

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponPercentInput, setCouponPercentInput] = useState<number>(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security State
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setSecurityLoading(true);
    const success = await requestPasswordChangeOtp(newAdminPassword);
    setSecurityLoading(false);
    if (success) {
      setOtpSent(true);
      toast.success("Validation OTP dispatched.", {
        description: "Please check NevrfadeClothing@gmail.com inbox."
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityLoading(true);
    const success = await verifyAndChangePassword(otpCode);
    setSecurityLoading(false);
    if (success) {
      toast.success("Administrator passphrase successfully bypassed and modified.");
      setOtpSent(false);
      setNewAdminPassword("");
      setOtpCode("");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
      fetchCoupons();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (colorConfigs.length === 0) {
      alert("Please add at least one color option configuration.");
      return;
    }

    for (const config of colorConfigs) {
      if (!config.color.trim()) {
        alert("Please specify a color name or hex code for all color configs.");
        return;
      }
      if (config.images.length === 0) {
        alert(`Please upload or add at least one image for the color "${config.color}".`);
        return;
      }
    }

    const variants = colorConfigs.flatMap(config => 
      ALL_SIZES.map(size => ({
        color: config.color.trim(),
        size,
        stock: config.stock[size] || 0
      }))
    );

    const activeColors = Array.from(new Set(colorConfigs.map(c => c.color.trim())));
    const activeSizes = ALL_SIZES.filter(size => 
      colorConfigs.some(config => (config.stock[size] || 0) > 0)
    );

    const colorImgMap: Record<string, string[]> = {};
    colorConfigs.forEach(config => {
      colorImgMap[config.color.trim()] = config.images;
    });

    const allImages = Array.from(new Set(colorConfigs.flatMap(config => config.images)));

    const payload = {
      title: formData.title,
      name: formData.title,
      category: formData.category,
      description: formData.description,
      price: parseFloat(formData.price),
      sizes: activeSizes,
      colors: activeColors,
      variants: variants,
      image: allImages[0] || "",
      images: allImages,
      colorImages: colorImgMap
    };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      alert("Error saving product.");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      name: "",
      category: "",
      description: "",
      price: "",
      images: [],
      colors: [],
      sizes: [],
      stockByVariant: {}
    });
    setColorConfigs([
      {
        id: Math.random().toString(),
        color: "#000000",
        images: [],
        stock: ALL_SIZES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {})
      }
    ]);
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    
    let colorImgMap: Record<string, string[]> = {};
    if (product.colorImages) {
      try {
        colorImgMap = typeof product.colorImages === 'string'
          ? JSON.parse(product.colorImages)
          : product.colorImages;
      } catch (e) {
        console.error("Error parsing product.colorImages in startEdit:", e);
      }
    }
    
    const uniqueColors = product.colors && product.colors.length > 0
      ? product.colors
      : ['Default'];
      
    const configs: ColorConfig[] = uniqueColors.map((color: string) => {
      const stockMap: Record<string, number> = {};
      ALL_SIZES.forEach(s => {
        stockMap[s] = product.stockByVariant[`${color}::${s}`] !== undefined
          ? (product.stockByVariant[`${color}::${s}`] || 0)
          : (product.stockByVariant[`Default::${s}`] || 0);
      });
      
      let colorImages = colorImgMap[color] || [];
      if (colorImages.length === 0) {
        colorImages = Array.isArray(product.images) ? product.images : [];
      }
      
      return {
        id: Math.random().toString(),
        color: color,
        images: colorImages,
        stock: stockMap
      };
    });

    setFormData({
      title: product.title || product.name || "",
      name: product.name || product.title || "",
      category: product.category || "",
      description: product.description || "",
      price: (product.price || 0).toString(),
      images: Array.isArray(product.images) ? product.images : [],
      colors: product.colors || [],
      sizes: product.sizes || [],
      stockByVariant: {}
    });
    setColorConfigs(configs);
    setActiveTab("products");
  };

  const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, configId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    
    // Show local preview immediately
    setColorConfigs(prev => prev.map(c => 
      c.id === configId ? { ...c, images: [...c.images, localUrl] } : c
    ));

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({ image: base64 })
        });

        const result = await response.json();
        if (result.url) {
          setColorConfigs(prev => prev.map(c => 
            c.id === configId 
              ? { ...c, images: c.images.map(img => img === localUrl ? result.url : img) }
              : c
          ));
          toast.success("Color asset uploaded successfully");
        } else {
          throw new Error("Upload failed");
        }
      } catch (err) {
        toast.error("Failed to upload color asset");
        setColorConfigs(prev => prev.map(c => 
          c.id === configId ? { ...c, images: c.images.filter(img => img !== localUrl) } : c
        ));
      } finally {
        URL.revokeObjectURL(localUrl);
      }
    };
    reader.readAsDataURL(file);
    
    // Clear input
    e.target.value = "";
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim() || couponPercentInput <= 0 || couponPercentInput > 100) {
      toast.error("Please provide a valid coupon code and percentage.");
      return;
    }
    setCouponLoading(true);
    try {
      await createCoupon({
        code: couponCodeInput.toUpperCase().trim(),
        discountPercent: couponPercentInput
      });
      toast.success(`Coupon code ${couponCodeInput.toUpperCase()} generated successfully!`);
      setCouponCodeInput("");
      setCouponPercentInput(0);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate coupon code.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      toast.success("Coupon code deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete coupon code.");
    }
  };

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [resetOtpCode, setResetOtpCode] = useState("");

  const handleForgotRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setSecurityLoading(true);
    try {
      const { requestAdminForgotPasswordOtp } = await import('@/lib/products');
      const res = await requestAdminForgotPasswordOtp(newAdminPassword);
      if (res.success) {
        setForgotPasswordStep(2);
        toast.success("Reset OTP dispatched.", { description: "Please check NevrfadeClothing@gmail.com inbox." });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to request OTP');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityLoading(true);
    try {
      const { verifyAdminForgotPasswordOtp } = await import('@/lib/products');
      const res = await verifyAdminForgotPasswordOtp(resetOtpCode);
      if (res.success) {
        toast.success("Administrator passphrase successfully modified.");
        setShowForgotPassword(false);
        setForgotPasswordStep(1);
        setNewAdminPassword("");
        setResetOtpCode("");
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify OTP');
    } finally {
      setSecurityLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F0EB] flex items-center justify-center p-6 font-sans">
        <Card className="w-full max-w-md border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white overflow-hidden relative">
          <CardHeader className="text-center space-y-2 pt-10">
            <div className="mx-auto bg-black text-white w-12 h-12 rounded-full flex items-center justify-center mb-4">
               {showForgotPassword ? <Lock className="w-5 h-5"/> : <Package className="w-6 h-6" />}
            </div>
            <CardTitle className="text-3xl font-heading tracking-tight uppercase">
               {showForgotPassword ? "Reset Access" : "Nevr Fade Admin"}
            </CardTitle>
            <CardDescription className="font-medium">
               {showForgotPassword ? "Strict 2-Step Verification Protocol" : "Management Authentication Protocol"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10">
            {!showForgotPassword ? (
               <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-left-4">
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-gray-400 tracking-widest">Access Key</label>
                   <Input 
                     placeholder="Username" 
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     className="h-12 border-gray-100 bg-gray-50/50 focus:bg-white transition-all rounded-xl"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase text-gray-400 tracking-widest">Secret Phase</label>
                   <Input 
                     type="password" 
                     placeholder="••••••••" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="h-12 border-gray-100 bg-gray-50/50 focus:bg-white transition-all rounded-xl"
                   />
                 </div>
                 {error && <p className="text-red-500 text-sm font-bold animate-shake">{error}</p>}
                 <Button type="submit" className="w-full bg-black text-white hover:bg-zinc-800 h-14 text-sm font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg transition-transform active:scale-95">
                   Initialize Session
                 </Button>
                 <div className="text-center mt-4">
                    <button type="button" onClick={() => setShowForgotPassword(true)} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                       Forgot Secret Phase?
                    </button>
                 </div>
               </form>
            ) : (
               <div className="animate-in fade-in slide-in-from-right-4">
                  {forgotPasswordStep === 1 ? (
                     <form onSubmit={handleForgotRequestOtp} className="space-y-4">
                       <div className="space-y-2">
                         <label className="text-xs font-bold uppercase text-gray-400 tracking-widest">New Passphrase</label>
                         <Input 
                           type="password"
                           value={newAdminPassword}
                           onChange={(e) => setNewAdminPassword(e.target.value)}
                           className="h-12 border-gray-100 bg-gray-50/50 focus:bg-white transition-all rounded-xl"
                           placeholder="Enter new strong password"
                           required
                         />
                       </div>
                       <div className="grid grid-cols-2 gap-3 pt-2">
                          <Button type="button" variant="outline" disabled={securityLoading} onClick={() => setShowForgotPassword(false)} className="h-14 text-xs font-bold uppercase tracking-widest rounded-xl">
                            Cancel
                          </Button>
                          <Button type="submit" disabled={securityLoading} className="bg-black text-white hover:bg-zinc-800 h-14 text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg flex gap-2">
                            {securityLoading ? '...' : <><Mail className="w-4 h-4"/> Get OTP</>}
                          </Button>
                       </div>
                     </form>
                  ) : (
                     <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
                        <div className="bg-red-50 p-3 rounded-xl border border-red-100 mb-4">
                           <p className="text-xs text-red-800 font-medium leading-relaxed">
                             A 6-digit key was sent to <b>NevrfadeClothing@gmail.com</b>
                           </p>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold uppercase text-gray-400 tracking-widest">Verification Key</label>
                           <Input 
                             type="number"
                             value={resetOtpCode}
                             onChange={(e) => setResetOtpCode(e.target.value)}
                             className="h-14 text-center text-xl tracking-[0.5em] border-gray-200 bg-gray-50/50 rounded-xl font-heading"
                             placeholder="------"
                             required
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <Button type="button" variant="outline" disabled={securityLoading} onClick={() => setForgotPasswordStep(1)} className="h-14 text-xs font-bold uppercase tracking-widest rounded-xl">
                            Back
                          </Button>
                          <Button type="submit" disabled={securityLoading} className="bg-red-500 text-white hover:bg-red-600 h-14 text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg flex gap-2">
                            {securityLoading ? '...' : <><Lock className="w-4 h-4"/> Verify</>}
                          </Button>
                       </div>
                     </form>
                  )}
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-zinc-900 font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100 pb-8">
          <div className="flex items-center gap-4">
             <div className="bg-black text-white p-3 rounded-2xl">
                <LayoutDashboard className="w-8 h-8" />
             </div>
             <div>
                <h1 className="text-4xl font-heading tracking-tight leading-none">STATION_001</h1>
                <p className="text-zinc-400 font-medium text-sm mt-1 uppercase tracking-widest">Warehouse Management System</p>
             </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" onClick={fetchProducts} className="rounded-xl px-6 border-zinc-200 font-bold uppercase text-xs tracking-widest">
                Refresh Sync
             </Button>
             <Button onClick={logout} className="rounded-xl px-6 bg-red-50 text-red-600 hover:bg-red-100 border-none font-bold uppercase text-xs tracking-widest flex gap-2">
                <LogOut className="w-4 h-4" /> Terminate
             </Button>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-zinc-100/80 p-1 rounded-2xl flex max-w-[400px] backdrop-blur-sm">
            <TabsTrigger value="products" className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all gap-2 py-3 text-xs font-bold uppercase tracking-widest">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all gap-2 py-3 text-xs font-bold uppercase tracking-widest text-zinc-600">
              Coupons
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all gap-2 py-3 text-xs font-bold uppercase tracking-widest text-zinc-600">
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
               <div className="xl:col-span-5 space-y-6">
                  <Card className="border-none shadow-xl rounded-3xl bg-white sticky top-8">
                     <CardHeader className="p-8 border-b border-zinc-50">
                        <div className="flex justify-between items-center">
                           <CardTitle className="font-heading text-2xl uppercase">
                              {editingId ? 'Modify Record' : 'Inject Item'}
                           </CardTitle>
                           {editingId && (
                             <Button size="icon" variant="ghost" onClick={resetForm} className="rounded-full text-red-500 bg-red-50 hover:bg-red-100">
                                <X className="w-4 h-4" />
                             </Button>
                           )}
                        </div>
                     </CardHeader>
                     <CardContent className="p-8 space-y-6">
                        <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Item Heading</label>
                              <Input 
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="h-12 border-zinc-100 bg-zinc-50/50 rounded-xl font-bold"
                                placeholder="E.G. OVERSIZED NEURON HOODIE"
                              />
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Category</label>
                                 <Input 
                                   value={formData.category}
                                   onChange={(e) => setFormData({...formData, category: e.target.value})}
                                   className="h-12 border-zinc-100 rounded-xl"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Price Key (₹)</label>
                                 <Input 
                                   type="number"
                                   value={formData.price}
                                   onChange={(e) => setFormData({...formData, price: e.target.value})}
                                   className="h-12 border-zinc-100 rounded-xl font-heading text-lg"
                                 />
                              </div>
                           </div>

                              <div className="space-y-6">
                              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Color Options ({colorConfigs.length})</label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setColorConfigs(prev => [
                                      ...prev,
                                      {
                                        id: Math.random().toString(),
                                        color: "",
                                        images: [],
                                        stock: ALL_SIZES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {})
                                      }
                                    ]);
                                  }}
                                  className="rounded-xl border-zinc-100 hover:bg-zinc-50 text-[10px] font-bold uppercase tracking-widest px-3 h-8 flex gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add Color
                                </Button>
                              </div>

                              <div className="space-y-8">
                                {colorConfigs.map((config, index) => (
                                  <div key={config.id} className="p-6 rounded-3xl border border-zinc-100 bg-zinc-50/50 space-y-6 relative group/card">
                                    {/* Remove Color Option Button */}
                                    {colorConfigs.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setColorConfigs(prev => prev.filter(c => c.id !== config.id));
                                        }}
                                        className="absolute top-4 right-4 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 w-8 h-8 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    )}

                                    {/* Color Name Input */}
                                    <div className="space-y-2">
                                      <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Color Value (Hex/Name)</label>
                                      <div className="flex items-center gap-3">
                                        <div 
                                          className="w-8 h-8 rounded-full border border-zinc-200 flex-shrink-0 transition-all shadow-sm"
                                          style={{ 
                                            backgroundColor: config.color.toLowerCase() === 'default' 
                                              ? 'transparent' 
                                              : (config.color.trim() || 'transparent')
                                          }} 
                                        />
                                        <Input
                                          placeholder="e.g. #000000 or Black"
                                          value={config.color}
                                          onChange={(e) => {
                                            setColorConfigs(prev => prev.map(c => 
                                              c.id === config.id ? { ...c, color: e.target.value } : c
                                            ));
                                          }}
                                          className="rounded-xl bg-white border-zinc-200 h-9 text-xs"
                                          required
                                        />
                                      </div>
                                    </div>

                                    {/* Color Images Upload */}
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Color Assets (Images)</label>
                                        <div>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            id={`file-input-${config.id}`}
                                            onChange={(e) => handleColorImageUpload(e, config.id)}
                                            className="hidden"
                                          />
                                          <label
                                            htmlFor={`file-input-${config.id}`}
                                            className="cursor-pointer inline-flex items-center gap-1 bg-white hover:bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-sm transition-all"
                                          >
                                            <Upload className="w-3 h-3" /> Upload File
                                          </label>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-4 gap-3">
                                        {config.images.map((url, i) => {
                                          const isLocal = url.startsWith('blob:');
                                          return (
                                            <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white group border border-zinc-100 shadow-sm">
                                              <img src={url} className={`w-full h-full object-cover ${isLocal ? 'opacity-40 animate-pulse' : ''}`} />
                                              <button 
                                                type="button" 
                                                onClick={() => {
                                                  setColorConfigs(prev => prev.map(c => 
                                                    c.id === config.id 
                                                      ? { ...c, images: c.images.filter((_, idx) => idx !== i) }
                                                      : c
                                                  ));
                                                }}
                                                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          );
                                        })}
                                        {config.images.length === 0 && (
                                          <div className="col-span-4 py-6 border border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center text-zinc-300 bg-white">
                                            <ImageIcon className="w-6 h-6 mb-1" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">No Imagery for color</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Color Sizes Stock */}
                                    <div className="space-y-3 pt-2 border-t border-zinc-100">
                                      <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Size Stock Levels</label>
                                      <div className="grid grid-cols-5 gap-2">
                                        {ALL_SIZES.map(s => {
                                          const qty = config.stock[s] || 0;
                                          return (
                                            <div key={s} className="flex flex-col items-center bg-white p-2 rounded-xl border border-zinc-100 shadow-sm">
                                              <span className="text-[10px] font-bold text-zinc-400 mb-1">{s}</span>
                                              <Input 
                                                type="number"
                                                min="0"
                                                value={qty}
                                                onChange={(e) => {
                                                  const val = Math.max(0, parseInt(e.target.value) || 0);
                                                  setColorConfigs(prev => prev.map(c => 
                                                    c.id === config.id 
                                                      ? { ...c, stock: { ...c.stock, [s]: val } }
                                                      : c
                                                  ));
                                                }}
                                                className="w-10 h-7 border-none bg-zinc-50 rounded-lg text-center font-heading text-xs p-0 focus:bg-zinc-100 transition-colors"
                                              />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                           <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Record Description</label>
                              <Textarea 
                                 value={formData.description}
                                 onChange={(e) => setFormData({...formData, description: e.target.value})}
                                 className="min-h-[120px] rounded-2xl bg-zinc-50/50 border-zinc-100 focus:bg-white transition-all p-4"
                                 placeholder="Detailed item specifications..."
                              />
                           </div>

                           <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-zinc-900 h-16 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl flex gap-3">
                              {loading ? 'Processing...' : (editingId ? <><Save className="w-5 h-5" /> Commit Changes</> : <><Plus className="w-5 h-5" /> Initialize Unit</>)}
                           </Button>
                        </form>
                     </CardContent>
                  </Card>
               </div>

               <div className="xl:col-span-7 space-y-6">
                  <div className="flex items-center justify-between">
                     <h2 className="text-3xl font-heading tracking-tight flex items-center gap-3 uppercase">
                        Archive <span className="text-zinc-300 text-sm">/ {products.length} Units</span>
                     </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {products.map((product) => (
                        <Card key={product.id} className="bg-white border-none shadow-sm rounded-3xl overflow-hidden flex h-40 group hover:shadow-lg transition-all">
                           <div className="w-32 h-full bg-zinc-100 flex-shrink-0 relative overflow-hidden">
                              <img src={product.image || product.images?.[0]} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                           </div>
                           <div className="p-5 flex flex-col justify-between flex-1">
                              <div>
                                 <Badge className="bg-zinc-100 text-zinc-500 border-none text-[8px] font-black uppercase mb-2 tracking-tighter">{product.category}</Badge>
                                 <h3 className="font-heading text-lg leading-tight uppercase line-clamp-1">{product.title || product.name}</h3>
                                 <p className="font-heading text-xl mt-1">{formatINR(product.price)}</p>
                                 <div className="flex flex-wrap gap-1 mt-2">
                                    {ALL_SIZES.map((s) => {
                                       const qty = (product.colors || []).reduce((acc: number, color: string) => {
                                          return acc + (product.stockByVariant?.[`${color}::${s}`] || 0);
                                       }, 0);
                                       if (qty === 0) return null;
                                       return <span key={s} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 text-white">{s}: {qty}</span>;
                                    })}
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <Button size="sm" variant="outline" onClick={() => startEdit(product)} className="flex-1 rounded-xl border-zinc-100 font-bold uppercase text-[9px] tracking-widest gap-2">
                                    <Edit className="w-3 h-3" /> Edit
                                 </Button>
                                 <Button size="icon" variant="outline" onClick={() => deleteProduct(product.id)} className="rounded-xl border-red-50 text-red-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100">
                                    <Trash2 className="w-4 h-4" />
                                 </Button>
                              </div>
                           </div>
                        </Card>
                     ))}
                     {products.length === 0 && (
                        <div className="col-span-full py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-100 flex flex-col items-center justify-center text-zinc-300">
                           <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                           <p className="font-bold uppercase tracking-widest text-sm">Archive Empty</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="coupons" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Generate Coupon Form */}
              <div className="xl:col-span-4">
                <Card className="border-none shadow-xl rounded-3xl bg-white">
                  <CardHeader className="p-8 border-b border-zinc-50">
                    <CardTitle className="font-heading text-2xl uppercase">Generate Coupon</CardTitle>
                    <CardDescription className="font-sans text-xs">Create custom discounts for checkouts</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleCreateCoupon} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Coupon Code</label>
                        <Input
                          placeholder="e.g. NEVERFADE100"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          className="rounded-2xl bg-zinc-50 border-zinc-100 font-heading tracking-wider"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Discount Percentage</label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="e.g. 15"
                          value={couponPercentInput || ""}
                          onChange={(e) => setCouponPercentInput(Math.min(100, Math.max(1, parseInt(e.target.value) || 0)))}
                          className="rounded-2xl bg-zinc-50 border-zinc-100 font-heading"
                          required
                        />
                      </div>
                      <Button type="submit" disabled={couponLoading} className="w-full rounded-2xl bg-black hover:bg-zinc-800 text-white font-bold uppercase text-xs tracking-widest py-6 cursor-pointer">
                        {couponLoading ? "Generating..." : "Generate Discount Code"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Coupons List */}
              <div className="xl:col-span-8">
                <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
                  <CardHeader className="p-8 border-b border-zinc-50 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="font-heading text-2xl uppercase">Active Coupons</CardTitle>
                      <CardDescription className="font-sans text-xs">A list of all valid coupon codes in the system</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-zinc-50/50">
                        <TableRow className="border-b border-zinc-50">
                          <TableHead className="font-heading text-zinc-400 uppercase text-[10px] tracking-wider py-4 pl-8">Code</TableHead>
                          <TableHead className="font-heading text-zinc-400 uppercase text-[10px] tracking-wider py-4">Discount</TableHead>
                          <TableHead className="font-heading text-zinc-400 uppercase text-[10px] tracking-wider py-4">Status</TableHead>
                          <TableHead className="font-heading text-zinc-400 uppercase text-[10px] tracking-wider py-4">Date Created</TableHead>
                          <TableHead className="font-heading text-zinc-400 uppercase text-[10px] tracking-wider py-4 pr-8 text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {coupons.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12 text-zinc-400 font-sans text-xs">
                              No coupon codes have been generated yet.
                            </TableCell>
                          </TableRow>
                        ) : (
                          coupons.map((coupon) => (
                            <TableRow key={coupon.id} className="border-b border-zinc-50/50 hover:bg-zinc-50/30 transition-colors">
                              <TableCell className="py-4 pl-8 font-heading text-zinc-950 font-bold tracking-wider">{coupon.code}</TableCell>
                              <TableCell className="py-4 font-sans text-sm text-green-600 font-semibold">{coupon.discountPercent}% Off</TableCell>
                              <TableCell className="py-4">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-none rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase">
                                  {coupon.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 font-sans text-xs text-zinc-400">
                                {new Date(coupon.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </TableCell>
                              <TableCell className="py-4 pr-8 text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full w-8 h-8 cursor-pointer"
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="max-w-2xl mx-auto space-y-8 mt-12">
               <div className="text-center space-y-4">
                 <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                   <ShieldCheck className="w-8 h-8" />
                 </div>
                 <h2 className="text-3xl font-heading tracking-tight uppercase">Modify Access Keys</h2>
                 <p className="text-zinc-500">Administrator passphrase updates require strict 2-step verification via your registered SMTP secure channel.</p>
               </div>

               <Card className="border-none shadow-2xl rounded-3xl bg-white p-4">
                 <CardContent className="p-8">
                   {!otpSent ? (
                     <form onSubmit={handleRequestOtp} className="space-y-6">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] flex items-center gap-2">
                           <Lock className="w-3 h-3"/> New Passphrase
                         </label>
                         <Input 
                           type="password"
                           value={newAdminPassword}
                           onChange={(e) => setNewAdminPassword(e.target.value)}
                           placeholder="Enter new strong password"
                           className="h-14 border-zinc-100 bg-zinc-50/50 rounded-xl font-bold"
                           required
                         />
                       </div>
                       <Button type="submit" disabled={securityLoading} className="w-full bg-black text-white hover:bg-zinc-900 h-14 rounded-xl font-bold uppercase tracking-widest text-sm shadow-xl flex gap-3">
                         {securityLoading ? 'Generating Token...' : <><Mail className="w-5 h-5"/> Send Validation OTP</>}
                       </Button>
                     </form>
                   ) : (
                     <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right-4">
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-4 mb-8">
                           <Mail className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                           <p className="text-sm text-red-800 font-medium leading-relaxed">
                             A 6-digit confirmation key has been dispatched to <b>NevrfadeClothing@gmail.com</b>. The key will expire in exactly 10 minutes.
                           </p>
                        </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] flex items-center gap-2">
                           Verification Key
                         </label>
                         <Input 
                           type="number"
                           value={otpCode}
                           onChange={(e) => setOtpCode(e.target.value)}
                           placeholder="000000"
                           className="h-16 text-center text-2xl tracking-[1em] border-zinc-200 bg-zinc-50/50 rounded-xl font-bold font-heading"
                           required
                         />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <Button type="button" variant="outline" disabled={securityLoading} onClick={() => setOtpSent(false)} className="h-14 rounded-xl font-bold uppercase tracking-widest text-sm border-zinc-200">
                           Cancel
                         </Button>
                         <Button type="submit" disabled={securityLoading} className="bg-red-500 text-white hover:bg-red-600 h-14 rounded-xl font-bold uppercase tracking-widest text-sm shadow-xl flex gap-3">
                           {securityLoading ? 'Verifying...' : <><Lock className="w-5 h-5"/> Verify & Change</>}
                         </Button>
                       </div>
                     </form>
                   )}
                 </CardContent>
               </Card>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
