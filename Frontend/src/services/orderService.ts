// Frontend/src/services/orderService.ts
const API_URL = "http://localhost:5000/api/orders";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const orderService = {
  getAllOrders: async (status?: string, paymentStatus?: string, page = 1, limit = 10) => {
    let url = `${API_URL}?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (paymentStatus) url += `&paymentStatus=${paymentStatus}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  getOrderById: async (id: string) => {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  createOrder: async (orderData: any) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    return await response.json();
  },

  updateOrderStatus: async (id: string, status: string) => {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return await response.json();
  },

  updateOrder: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    const response = await fetch(`${API_URL}/${id}/payment`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ paymentStatus }),
    });
    return await response.json();
  },

  deleteOrder: async (id: string) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await response.json();
  },

  getSalesReport: async () => {
    const response = await fetch(`${API_URL}/reports/sales`, {
      headers: getAuthHeaders(),
    });
    return await response.json();
  },
};
