import React, { useEffect, useState } from 'react'
import { categoryService } from '../../services/categoryService'

const EditCategoryModal = ({ isOpen, category, onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', description: '', status: 'active' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        description: category.description || '',
        status: category.status || 'active',
      })
    }
  }, [category])

  if (!isOpen || !category) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await categoryService.updateCategory(category._id, form)
      alert('Cập nhật danh mục thành công')
      onSave?.()
      onClose?.()
    } catch (err) {
      console.error('Error updating category:', err)
      alert('Lỗi khi cập nhật danh mục')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Chỉnh sửa danh mục</h3>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Nhập tên danh mục"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Nhập mô tả"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select 
                value={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">✅ Hoạt động</option>
                <option value="inactive">⊘ Không hoạt động</option>
              </select>
            </div>
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

export default EditCategoryModal
