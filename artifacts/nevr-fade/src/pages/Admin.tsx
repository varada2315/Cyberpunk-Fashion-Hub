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

  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security State
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPassword.length < 6) return toast.error("Password must be at least 6 characters.");
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
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(username, password);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      alert("Please add at least one product image.");
      return;
    }

    // Capture all sizes that have stock > 0
    const activeSizes = ALL_SIZES.filter(s => (formData.stockByVariant[`Default::${s}`] || 0) > 0);
    
    const colors = ['Default'];
    const variants = colors.flatMap(color => 
      ALL_SIZES.map(size => ({
        color,
        size,
        stock: formData.stockByVariant[`${color}::${size}`] || 0
      }))
    );

    const payload = {
      ...formData,
      name: formData.title,
      price: parseFloat(formData.price),
      sizes: activeSizes, // Only active sizes for the frontend filter
      variants: variants,
      image: formData.images[0],
      images: formData.images
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
      stockByVariant: ALL_SIZES.reduce((acc, s) => ({ ...acc, [`Default::${s}`]: 0 }), {})
    });
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    
    // Ensure all sizes are represented in stockByVariant
    const stockMap = { ...product.stockByVariant };
    ALL_SIZES.forEach(s => {
       if (stockMap[`Default::${s}`] === undefined) {
          stockMap[`Default::${s}`] = 0;
       }
    });

    setFormData({
      title: product.title || product.name || "",
      name: product.name || product.title || "",
      category: product.category || "",
      description: product.description || "",
      price: (product.price || 0).toString(),
      images: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []),
      colors: product.colors || [],
      sizes: product.sizes || [],
      stockByVariant: stockMap
    });
    setActiveTab("products");
  };

  const addImage = () => {
    if (imageUrlInput && !formData.images.includes(imageUrlInput)) {
      setFormData({ ...formData, images: [...formData.images, imageUrlInput] });
      setImageUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const updateStock = (size: string, delta: number) => {
    const key = `Default::${size}`;
    const current = formData.stockByVariant[key] || 0;
    const next = Math.max(0, current + delta);
    setFormData({
      ...formData,
      stockByVariant: { ...formData.stockByVariant, [key]: next }
    });
  };

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages = [...formData.images];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Create a local preview immediately
      const localUrl = URL.createObjectURL(file);
      
      // We'll temporarily add the local URL to the images list
      // This gives instant feedback
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, localUrl]
      }));

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
            // Replace the local preview URL with the real server URL
            setFormData(prev => ({
              ...prev,
              images: prev.images.map(img => img === localUrl ? result.url : img)
            }));
          } else {
             // If no URL returned, remove the local preview
             setFormData(prev => ({
               ...prev,
               images: prev.images.filter(img => img !== localUrl)
             }));
             alert("Upload failed for " + file.name);
          }
        } catch (err) {
          console.error("Upload failed", err);
          // Remove the failed preview
          setFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img !== localUrl)
          }));
          alert("Failed to upload " + file.name);
        } finally {
          // Check if all files in this batch are done (simplified)
          if (i === files.length - 1) setUploading(false);
          URL.revokeObjectURL(localUrl);
        }
      };
      
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [resetOtpCode, setResetOtpCode] = useState("");

  const handleForgotRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPassword.length < 6) return toast.error("Password must be at least 6 characters.");
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
          <TabsList className="bg-zinc-100/80 p-1 rounded-2xl flex max-w-[300px] backdrop-blur-sm">
            <TabsTrigger value="products" className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all gap-2 py-3 text-xs font-bold uppercase tracking-widest">
              Inventory
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

                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Visual Assets (Images)</label>
                              <div className="flex gap-2">
                                 <Input 
                                    value={imageUrlInput}
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                    placeholder="Paste Image URL"
                                    className="h-11 border-zinc-100 rounded-xl"
                                 />
                                 <Button type="button" onClick={addImage} className="bg-zinc-900 rounded-xl px-4">
                                    <Plus className="w-5 h-5" />
                                 </Button>
                                 <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    onChange={handleFileUpload} 
                                    multiple 
                                    accept="image/*"
                                 />
                                 <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-xl border-zinc-200">
                                    <Upload className="w-5 h-5" />
                                 </Button>
                              </div>
                              <div className="grid grid-cols-4 gap-3">
                                 {formData.images.map((url, i) => {
                                    const isLocal = url.startsWith('blob:');
                                    return (
                                       <div key={i} className={`aspect-square rounded-xl overflow-hidden bg-zinc-100 relative group ${isLocal ? 'opacity-70' : ''}`}>
                                          <img src={url} className="w-full h-full object-cover" />
                                          {isLocal && (
                                             <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                             </div>
                                          )}
                                          {!isLocal && (
                                             <button 
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                             >
                                                <Trash2 className="w-5 h-5" />
                                             </button>
                                          )}
                                          {i === 0 && <Badge className="absolute top-1 left-1 bg-black/50 text-white border-none text-[8px] px-1 py-0">MAIN</Badge>}
                                       </div>
                                    );
                                 })}
                                 {formData.images.length === 0 && (
                                    <div className="col-span-4 py-8 border-2 border-dashed border-zinc-100 rounded-2xl flex flex-col items-center justify-center text-zinc-300">
                                       <ImageIcon className="w-8 h-8 mb-2" />
                                       <span className="text-[10px] font-bold uppercase tracking-widest">No Imagery Found</span>
                                    </div>
                                 )}
                              </div>
                           </div>

                           <div className="bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100 space-y-6">
                              <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Set Units Per Size</h4>
                              <div className="grid grid-cols-1 gap-4">
                                 {ALL_SIZES.map(s => {
                                    const key = `Default::${s}`;
                                    const qty = formData.stockByVariant[key] || 0;
                                    return (
                                       <div key={s} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-zinc-50 shadow-sm">
                                          <div className="flex items-center gap-4">
                                             <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm">
                                                {s}
                                             </div>
                                             <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Size {s}</span>
                                          </div>
                                          <div className="flex items-center gap-3">
                                             <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="icon" 
                                                onClick={() => updateStock(s, -1)}
                                                className="w-8 h-8 rounded-lg border-zinc-100 text-zinc-400 hover:bg-zinc-50"
                                             >
                                                <Minus className="w-3 h-3" />
                                             </Button>
                                             <Input 
                                                type="number"
                                                value={qty}
                                                onChange={(e) => {
                                                   const val = Math.max(0, parseInt(e.target.value) || 0);
                                                   setFormData({ ...formData, stockByVariant: { ...formData.stockByVariant, [key]: val } });
                                                }}
                                                className="w-12 h-8 border-none bg-zinc-50 rounded-lg text-center font-heading text-sm p-0"
                                             />
                                             <Button 
                                                type="button" 
                                                variant="outline" 
                                                size="icon" 
                                                onClick={() => updateStock(s, 1)}
                                                className="w-8 h-8 rounded-lg border-zinc-100 text-zinc-400 hover:bg-zinc-50"
                                             >
                                                <Plus className="w-3 h-3" />
                                             </Button>
                                          </div>
                                       </div>
                                    );
                                 })}
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
                                       const qty = product.stockByVariant?.[`Default::${s}`] || 0;
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
