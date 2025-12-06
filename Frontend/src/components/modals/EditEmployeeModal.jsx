import React, { useEffect, useState } from 'react'
import { uploadImage } from '../../services/uploadService'
import { getAvatarUrl } from '../../utils/avatarHelper'
import { userService } from '../../services/userService'

const EditEmployeeModal = ({ isOpen, employee, onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', email: '', role: 'staff', status: 'active', password: '', avatar: '' })
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    if (employee) {
      setForm({ name: employee.name || '', email: employee.email || '', role: employee.role || 'staff', status: employee.status || 'active', password: '', avatar: employee.avatar || '' })
      setImagePreview(employee.avatar || null)
    }
  }, [employee])

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    setUploading(true)
    try {
      const imageUrl = await uploadImage(file, 'gopos/employees')
      setForm({ ...form, avatar: imageUrl })
    } catch (err) {
      alert('Lỗi upload ảnh: ' + err.message)
      setImagePreview(form.avatar || null)
    }
    setUploading(false)
  }

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) {
      alert('Vui lòng nhập tên và email')
      return
    }

    setLoading(true)
    try {
      const updateData = { name: form.name, email: form.email, role: form.role, status: form.status, avatar: form.avatar }
      if (form.password) updateData.password = form.password
      
      const res = await userService.updateUser(employee._id, updateData)
      if (res.message && (res.message.includes('thành công') || res.message.includes('successfully'))) {
        alert('Cập nhật nhân viên thành công')
        onSave?.()
        onClose?.()
      } else {
        alert('Lỗi: ' + (res.message || 'Không thành công'))
      }
    } catch (err) {
      console.error('Error updating employee:', err)
      alert('Lỗi khi cập nhật nhân viên: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Chỉnh sửa nhân viên</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhân viên</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên nhân viên"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu (để trống nếu không đổi)</label>
              <input 
                type="password" 
                value={form.password} 
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mật khẩu mới (tùy chọn)"
              />
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
              <input 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
                className="w-full px-3 py-2 border rounded-lg disabled:opacity-50"
              />
              {uploading && <p className="text-sm text-blue-500 mt-1">Đang upload ảnh...</p>}
              {imagePreview && (
                <div className="mt-2">
                  <img src={getAvatarUrl(imagePreview)} alt="Preview" className="h-24 w-24 object-cover rounded border-2 border-gray-200" />
                </div>
              )}
            </div>

            {/* Role Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
              <select 
                value={form.role} 
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="staff">👤 Nhân viên</option>
                <option value="admin">👨‍💼 Quản lý</option>
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select 
                value={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">✅ Hoạt động</option>
                <option value="inactive">⊘ Không hoạt động</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center space-x-2"
              >
                <i className="fas fa-check"></i>
                <span>{loading ? 'Đang lưu...' : 'Lưu'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditEmployeeModal
