import { useState, useEffect, useCallback } from "react";
import {
  Product,
  adminLogin,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  type CreateProductInput,
} from "@/lib/products";

const ADMIN_TOKEN_KEY = "admin_token";
const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024;
type VariantStock = Record<string, number>;

const getVariantKey = (color: string, size: string) => `${color}::${size}`;
const normalizeQuantity = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
};

const buildStockByVariant = (colors: string[], sizes: string[], current: VariantStock = {}): VariantStock => {
  const next: VariantStock = {};

  colors.forEach((color) => {
    sizes.forEach((size) => {
      const key = getVariantKey(color, size);
      next[key] = normalizeQuantity(current[key]);
    });
  });

  return next;
};

const getTotalStock = (stockByVariant: VariantStock = {}) =>
  Object.values(stockByVariant).reduce((sum, qty) => sum + normalizeQuantity(qty), 0);

const createEmptyProductForm = (): Omit<CreateProductInput, "image"> & { imageUrl: string } => ({
  imageUrl: "",
  title: "",
  category: "",
  description: "",
  price: 0,
  colors: [],
  sizes: [],
  stockByVariant: {},
});

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export default function Admin() {
  const [adminToken, setAdminToken] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [productForm, setProductForm] = useState<Omit<CreateProductInput, "image"> & { imageUrl: string }>(
    createEmptyProductForm(),
  );
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = Boolean(adminToken);

  const loadProducts = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const fetchedProducts = await fetchAdminProducts(token);
      setProducts(fetchedProducts);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Failed to load products";
      if (messageText.toLowerCase().includes("unauthorized")) {
        setAdminToken("");
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      }
      setMessage({ type: "error", text: messageText });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminToken) {
      loadProducts(adminToken);
    }
  }, [adminToken, loadProducts]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await adminLogin(username, password);
      setAdminToken(response.token);
      localStorage.setItem(ADMIN_TOKEN_KEY, response.token);
      setUsername("");
      setPassword("");
      setMessage(null);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Login failed";
      setLoginError(text);
    }
  };

  const handleLogout = () => {
    setAdminToken("");
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setUsername("");
    setPassword("");
    setProducts([]);
    setMessage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "price") {
      const parsed = Number(value);
      setProductForm((prev) => ({ ...prev, price: Number.isFinite(parsed) ? parsed : 0 }));
      return;
    }

    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_IMAGE_FILE_BYTES) {
        setImageFile(null);
        setMessage({ type: "error", text: "Image too large. Max file size is 5MB." });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      setImageFile(file);
    }
  };

  const handleColorAdd = () => {
    const nextColor = colorInput.trim();
    if (nextColor && !productForm.colors.includes(nextColor)) {
      setProductForm((prev) => {
        const nextColors = [...prev.colors, nextColor];
        return {
          ...prev,
          colors: nextColors,
          stockByVariant: buildStockByVariant(nextColors, prev.sizes, prev.stockByVariant),
        };
      });
      setColorInput("");
    }
  };

  const handleColorRemove = (color: string) => {
    setProductForm((prev) => {
      const nextColors = prev.colors.filter((c) => c !== color);
      return {
        ...prev,
        colors: nextColors,
        stockByVariant: buildStockByVariant(nextColors, prev.sizes, prev.stockByVariant),
      };
    });
  };

  const handleSizeAdd = () => {
    const nextSize = sizeInput.trim();
    if (nextSize && !productForm.sizes.includes(nextSize)) {
      setProductForm((prev) => {
        const nextSizes = [...prev.sizes, nextSize];
        return {
          ...prev,
          sizes: nextSizes,
          stockByVariant: buildStockByVariant(prev.colors, nextSizes, prev.stockByVariant),
        };
      });
      setSizeInput("");
    }
  };

  const handleSizeRemove = (size: string) => {
    setProductForm((prev) => {
      const nextSizes = prev.sizes.filter((s) => s !== size);
      return {
        ...prev,
        sizes: nextSizes,
        stockByVariant: buildStockByVariant(prev.colors, nextSizes, prev.stockByVariant),
      };
    });
  };

  const setVariantStockQuantity = (color: string, size: string, nextQty: number) => {
    const key = getVariantKey(color, size);
    setProductForm((prev) => ({
      ...prev,
      stockByVariant: {
        ...prev.stockByVariant,
        [key]: normalizeQuantity(nextQty),
      },
    }));
  };

  const adjustVariantStock = (color: string, size: string, delta: number) => {
    const key = getVariantKey(color, size);
    setProductForm((prev) => {
      const currentQty = normalizeQuantity(prev.stockByVariant[key]);
      return {
        ...prev,
        stockByVariant: {
          ...prev.stockByVariant,
          [key]: normalizeQuantity(currentQty + delta),
        },
      };
    });
  };

  const resetProductForm = () => {
    setProductForm(createEmptyProductForm());
    setImageFile(null);
    setColorInput("");
    setSizeInput("");
    setEditingProductId(null);
  };

  const handleStartEdit = (product: Product) => {
    setEditingProductId(product.id);
    setProductForm({
      imageUrl: product.image,
      title: product.title,
      category: product.category,
      description: product.description,
      price: product.price,
      colors: [...product.colors],
      sizes: [...product.sizes],
      stockByVariant: buildStockByVariant(product.colors, product.sizes, product.stockByVariant || {}),
    });
    setImageFile(null);
    setColorInput("");
    setSizeInput("");
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetProductForm();
    setMessage({ type: "success", text: "Edit cancelled." });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminToken) {
      setMessage({ type: "error", text: "You must be logged in." });
      return;
    }

    try {
      setIsSubmitting(true);

      let image = productForm.imageUrl.trim();
      if (imageFile) {
        image = await fileToDataUrl(imageFile);
      }

      if (!image) {
        throw new Error("Please upload an image or provide an image URL.");
      }

      const payload: CreateProductInput = {
        image,
        title: productForm.title.trim(),
        category: productForm.category.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        colors: productForm.colors,
        sizes: productForm.sizes,
        stockByVariant: buildStockByVariant(productForm.colors, productForm.sizes, productForm.stockByVariant),
      };

      if (editingProductId !== null) {
        const updatedProduct = await updateAdminProduct(adminToken, editingProductId, payload);
        setProducts((prev) => prev.map((product) => (product.id === editingProductId ? updatedProduct : product)));
        setMessage({ type: "success", text: "Product updated successfully." });
      } else {
        const createdProduct = await createAdminProduct(adminToken, payload);
        setProducts((prev) => [createdProduct, ...prev]);
        setMessage({ type: "success", text: "Product added successfully." });
      }

      resetProductForm();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to save product";
      setMessage({ type: "error", text });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!adminToken) {
      setMessage({ type: "error", text: "You must be logged in." });
      return;
    }

    try {
      setIsDeletingId(productId);
      await deleteAdminProduct(adminToken, productId);
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      setMessage({ type: "success", text: "Product deleted successfully." });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Failed to delete product";
      setMessage({ type: "error", text });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsDeletingId(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background w-full flex items-center justify-center">
        <div className="bg-secondary p-8 rounded-lg max-w-md w-full mx-4">
          <h1 className="font-heading text-3xl text-foreground mb-6 text-center">Admin Login</h1>

          {loginError && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg">{loginError}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                placeholder="Enter username"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 rounded-full text-lg font-medium tracking-wide uppercase transition-colors bg-[#F5F0EB] text-[#0D0D0D] hover:bg-[#C8B89A]"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Default credentials:</p>
            <p className="font-mono">User: admin</p>
            <p className="font-mono">Password: admin1234</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background w-full overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 py-16">
        <div className="flex justify-between items-center mb-12">
          <h1 className="font-heading text-4xl text-foreground">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-full text-sm font-medium tracking-wide uppercase transition-colors bg-[#F5F0EB] text-[#0D0D0D] hover:bg-[#C8B89A]"
          >
            Logout
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-secondary p-8 rounded-lg">
            <h2 className="font-heading text-2xl text-foreground mb-6">
              {editingProductId !== null ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Image Upload</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                  />
                  {imageFile && <div className="text-sm text-muted-foreground">{imageFile.name}</div>}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Upload an image file (JPG, PNG, etc.)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Image URL (optional)</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={productForm.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                  placeholder="https://example.com/product.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={productForm.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                  placeholder="Product title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={productForm.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                  placeholder="Product category"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                  placeholder="Product description"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={productForm.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Colors</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                    placeholder="Add color (e.g. Black)"
                  />
                  <button
                    type="button"
                    onClick={handleColorAdd}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {productForm.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full">
                      <span>{color}</span>
                      <button
                        type="button"
                        onClick={() => handleColorRemove(color)}
                        className="text-red-500 hover:text-red-700"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Sizes</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-primary/30 bg-background text-foreground"
                    placeholder="Add size (e.g. M)"
                  />
                  <button
                    type="button"
                    onClick={handleSizeAdd}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {productForm.sizes.map((size, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full">
                      <span>{size}</span>
                      <button
                        type="button"
                        onClick={() => handleSizeRemove(size)}
                        className="text-red-500 hover:text-red-700"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Stock by Color and Size</label>
                {productForm.colors.length === 0 || productForm.sizes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Add at least one color and one size to manage stock.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-primary/20">
                    <table className="w-full text-sm">
                      <thead className="bg-primary/10">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Color / Size</th>
                          {productForm.sizes.map((size) => (
                            <th key={size} className="px-3 py-2 text-center font-medium">
                              {size}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {productForm.colors.map((color) => (
                          <tr key={color} className="border-t border-primary/10">
                            <td className="px-3 py-2 font-medium">{color}</td>
                            {productForm.sizes.map((size) => {
                              const key = getVariantKey(color, size);
                              const quantity = normalizeQuantity(productForm.stockByVariant[key]);

                              return (
                                <td key={key} className="px-2 py-2">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => adjustVariantStock(color, size, -1)}
                                      disabled={quantity <= 0}
                                      className="w-7 h-7 rounded-full border border-primary/30 disabled:opacity-40"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      value={quantity}
                                      onChange={(e) => setVariantStockQuantity(color, size, Number(e.target.value))}
                                      className="w-16 px-2 py-1 rounded border border-primary/30 bg-background text-center"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => adjustVariantStock(color, size, 1)}
                                      className="w-7 h-7 rounded-full border border-primary/30"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <p className="mt-2 text-sm text-muted-foreground">
                  Total Stock: {getTotalStock(productForm.stockByVariant)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 rounded-full text-lg font-medium tracking-wide uppercase transition-colors bg-[#F5F0EB] text-[#0D0D0D] hover:bg-[#C8B89A] disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingProductId !== null ? "Update Product" : "Add Product"}
                </button>
                {editingProductId !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full px-6 py-3 rounded-full text-lg font-medium tracking-wide uppercase transition-colors border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div>
            <h2 className="font-heading text-2xl text-foreground mb-6">Current Products</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {products.map((product) => (
                <div key={product.id} className="border border-primary/30 rounded-lg p-4 bg-secondary">
                  <div className="flex gap-4">
                    <img src={product.image} alt={product.title} className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <h3 className="font-heading text-lg text-foreground">{product.title}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <p className="text-lg font-heading text-foreground">${product.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {getTotalStock(product.stockByVariant || {})}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(product)}
                        className="h-fit px-4 py-2 rounded-full text-xs font-medium tracking-wide uppercase transition-colors bg-[#0D0D0D] text-[#F5F0EB] hover:bg-[#242424]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeletingId === product.id}
                        className="h-fit px-4 py-2 rounded-full text-xs font-medium tracking-wide uppercase transition-colors bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {isDeletingId === product.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
