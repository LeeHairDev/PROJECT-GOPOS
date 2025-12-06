const API_URL = 'http://localhost:5000/api/users'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

interface NewUserData {
  name: string
  email: string
  password?: string
  role?: string
  phone?: string
  address?: string
}

export const userService = {
  getAllUsers: async () => {
    const res = await fetch(API_URL, { headers: getAuthHeaders() })
    return await res.json()
  },

  createUser: async (data: NewUserData) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return await res.json()
  },

  createUserByAdmin: async (data: NewUserData) => {
    const res = await fetch(`${API_URL}/admin-create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return await res.json()
  },

  updateUser: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data) })
    return await res.json()
  },

  deleteUser: async (id: string) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
    return await res.json()
  },
}