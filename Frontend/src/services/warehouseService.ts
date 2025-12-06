const API_URL = "http://localhost:5000/api/warehouses";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const warehouseService = {
  getAllWarehouses: async (status = null) => {
    try {
      let url = API_URL;
      if (status) {
        url += `?status=${status}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch warehouses");
      return await res.json();
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      throw err;
    }
  },

  getWarehouseById: async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error("Failed to fetch warehouse");
      return await res.json();
    } catch (err) {
      console.error("Error fetching warehouse:", err);
      throw err;
    }
  },

  createWarehouse: async (data) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create warehouse");
      return await res.json();
    } catch (err) {
      console.error("Error creating warehouse:", err);
      throw err;
    }
  },

  updateWarehouse: async (id, data) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update warehouse");
      return await res.json();
    } catch (err) {
      console.error("Error updating warehouse:", err);
      throw err;
    }
  },

  deleteWarehouse: async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete warehouse");
      return await res.json();
    } catch (err) {
      console.error("Error deleting warehouse:", err);
      throw err;
    }
  },
  setSellingWarehouse: async (id, isSelling) => {
    try {
      const res = await fetch(`${API_URL}/${id}/selling`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ isSelling }),
      });
      if (!res.ok) throw new Error("Failed to set selling warehouse");
      return await res.json();
    } catch (err) {
      console.error("Error setting selling warehouse:", err);
      throw err;
    }
  },
};
