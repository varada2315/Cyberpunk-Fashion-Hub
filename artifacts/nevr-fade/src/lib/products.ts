export interface Product {
  id: number;
  image: string;
  title: string;
  category: string;
  description: string;
  price: number;
  colors: string[];
  sizes: string[];
  stockByVariant?: Record<string, number>;
}

export interface AdminLoginResponse {
  token: string;
}

export interface CreateProductInput {
  image: string;
  title: string;
  category: string;
  description: string;
  price: number;
  colors: string[];
  sizes: string[];
  stockByVariant: Record<string, number>;
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = (data as { error?: string }).error || `Request failed with status ${response.status}`;
    throw new Error(message);
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
    body: JSON.stringify(payload)
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
    body: JSON.stringify(payload)
  });

  return parseApiResponse<Product>(response);
}

export async function deleteAdminProduct(token: string, productId: number): Promise<void> {
  const response = await fetch(`/api/admin/products/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  await parseApiResponse<{ success: boolean }>(response);
}
