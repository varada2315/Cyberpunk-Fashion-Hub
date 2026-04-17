import { createContext, useContext, useState, useEffect } from 'react';
import { adminLogin, fetchAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct } from '@/lib/products';

interface AdminContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  products: any[];
  fetchProducts: () => Promise<void>;
  createProduct: (product: any) => Promise<any>;
  updateProduct: (id: number, product: any) => Promise<any>;
  deleteProduct: (id: number) => Promise<void>;
  orders: any[];
  fetchOrders: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminContext must be used within an AdminProvider');
  }
  return context;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's a saved token in localStorage
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await adminLogin(username, password);
      setToken(response.token);
      setIsAuthenticated(true);
      localStorage.setItem('adminToken', response.token);
      return true;
    } catch (err) {
      setError('Invalid username or password');
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('adminToken');
    setProducts([]);
  };

  const fetchProducts = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedProducts = await fetchAdminProducts(token);
      setProducts(fetchedProducts);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: any) => {
    if (!token) return;
    
    try {
      const newProduct = await createAdminProduct(token, product);
      setProducts([...products, newProduct]);
      return newProduct;
    } catch (err) {
      setError('Failed to create product');
      throw err;
    }
  };

  const updateProduct = async (id: number, product: any) => {
    if (!token) return;
    
    try {
      const updatedProduct = await updateAdminProduct(token, id, product);
      setProducts(products.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      setError('Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: number) => {
    if (!token) return;
    
    try {
      await deleteAdminProduct(token, id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      setError('Failed to delete product');
      throw err;
    }
  };

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { fetchAdminOrders } = await import('@/lib/products');
      const fetchedOrders = await fetchAdminOrders(token);
      setOrders(fetchedOrders);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminContext.Provider value={{
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
      error
    }}>
      {children}
    </AdminContext.Provider>
  );
}