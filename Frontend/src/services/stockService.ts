const API_URL = "http://localhost:5000/api/stock";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const stockService = {
  createMovement: async (data: any) => {
    const res = await fetch(`${API_URL}/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  getMovements: async (params = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/?${query}`);
    return await res.json();
  },

  deleteMovement: async (id: string) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await res.json();
  },

  reportInventoryOverTime: async (params = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/report/inventory-over-time?${query}`);
    return await res.json();
  },

  reportTopImports: async (params = {}) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URL}/report/top-imports?${query}`);
    return await res.json();
  },
};
