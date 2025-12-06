// Frontend/src/services/productService.ts
const API_URL = "http://localhost:5000/api/products";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const productService = {
  getAllProducts: async (category?: string, status?: string, page = 1, limit = 10, search?: string) => {
    let url = `${API_URL}?page=${page}&limit=${limit}`;
    if (category) url += `&category=${category}`;
    if (status) url += `&status=${status}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await fetch(url);
    return await response.json();
  },

  getProductById: async (id: string) => {
    const response = await fetch(`${API_URL}/${id}`);
    return await response.json();
  },

  createProduct: async (productData: any) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    return await response.json();
  },

  updateProduct: async (id: string, productData: any) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    return await response.json();
  },

  deleteProduct: async (id: string) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  updateStock: async (id: string, quantity: number) => {
    const response = await fetch(`${API_URL}/${id}/stock`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });
    return await response.json();
  },
};
