export interface Product {
  id: number;
  name: string;
  title: string;
  description: string;
  category: string;
  price: number;
  salePrice?: number;
  sku?: string;
  variants?: any;
  images?: string[];
  image?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  colors?: string[];
  sizes?: string[];
  stockByVariant?: Record<string, number>;
  selectedColor?: string | null;
  selectedSize?: string | null;
}

export interface AdminLoginResponse {
  token: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  category: string;
  price: number;
  salePrice?: number;
  sku?: string;
  variants: Array<{
    color: string;
    size: string;
    stock: number;
  }>;
  images: string[];
  status?: string;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = (data as { error?: string }).error || `Request failed with status ${response.status}`;
    const error: any = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data as T;
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products');
  return parseApiResponse<Product[]>(response);
}

export async function fetchProduct(id: number): Promise<Product | null> {
  const response = await fetch(`/api/products/${id}`);
  if (response.status === 404) {
    return null;
  }
  return parseApiResponse<Product>(response);
}

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  const response = await fetch(`/api/products/filter?category=${encodeURIComponent(category)}`);
  return parseApiResponse<Product[]>(response);
}

export async function fetchProductsBySearch(search: string): Promise<Product[]> {
  const response = await fetch(`/api/products/filter?search=${encodeURIComponent(search)}`);
  return parseApiResponse<Product[]>(response);
}

export async function adminLogin(username: string, password: string): Promise<AdminLoginResponse> {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  return parseApiResponse<AdminLoginResponse>(response);
}

export async function fetchAdminProducts(token: string): Promise<Product[]> {
  const response = await fetch('/api/admin/products', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return parseApiResponse<Product[]>(response);
}

export async function createAdminProduct(token: string, payload: CreateProductInput): Promise<Product> {
  const response = await fetch('/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...payload,
      variants: payload.variants || [],
      images: payload.images || []
    })
  });

  return parseApiResponse<Product>(response);
}

export async function updateAdminProduct(token: string, productId: number, payload: CreateProductInput): Promise<Product> {
  const response = await fetch(`/api/admin/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...payload,
      variants: payload.variants || [],
      images: payload.images || []
    })
  });

  return parseApiResponse<Product>(response);
}

export async function deleteAdminProduct(token: string, productId: number): Promise<void> {
  const response = await fetch(`/api/admin/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Failed to delete product with ID ${productId}`);
  }
}

export interface Order {
  id: number;
  orderId: string;
  name: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  items: any[];
  amount: number;
  createdAt: string;
}

export async function fetchAdminOrders(token: string): Promise<Order[]> {
  const response = await fetch('/api/admin/orders', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return parseApiResponse<Order[]>(response);
}

export async function requestAdminPasswordOtp(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/admin/request-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ newPassword })
  });

  return parseApiResponse<{ success: boolean; message: string }>(response);
}

export async function verifyAdminPasswordOtp(token: string, otp: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/admin/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ otp })
  });

  return parseApiResponse<{ success: boolean; message: string }>(response);
}

export async function requestAdminForgotPasswordOtp(newPassword: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/admin/forgot-password-request-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ newPassword })
  });

  return parseApiResponse<{ success: boolean; message: string }>(response);
}

export async function verifyAdminForgotPasswordOtp(otp: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/admin/forgot-password-change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ otp })
  });

  return parseApiResponse<{ success: boolean; message: string }>(response);
}
