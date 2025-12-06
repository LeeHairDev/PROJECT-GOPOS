import React, { useEffect, useState } from 'react'
import { categoryService } from '../services/categoryService'
import { productService } from '../services/productService'
import EditCategoryModal from './modals/EditCategoryModal'
import AddCategoryModal from './modals/AddCategoryModal'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [editing, setEditing] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [productCounts, setProductCounts] = useState({})

  const load = async () => {
    const res = await categoryService.getAllCategories()
    // API returns { message, categories } or array; normalize
    const data = res?.categories || res?.value || res || []
    setCategories(Array.isArray(data) ? data : [])
    
    // Load product counts for each category
    loadProductCounts()
  }

  const loadProductCounts = async () => {
    try {
      const res = await productService.getAllProducts(undefined, undefined, 1, 1000)
      const products = res?.products || res || []
      
      console.log('📦 Products response:', res)
      console.log('📦 Products list:', products)
      
      // Count products by category.
      // `product.category` may be a populated object ({ _id, name }) or an id string,
      // normalize to the category id before counting.
      const counts = {}
      products.forEach(product => {
        const cat = product?.category
        const categoryId = cat?._id || (typeof cat === 'string' ? cat : undefined)
        if (categoryId) {
          counts[categoryId] = (counts[categoryId] || 0) + 1
        }
      })
      
      console.log('📊 Product counts:', counts)
      setProductCounts(counts)
    } catch (err) {
      console.error('Error loading product counts:', err)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openEdit = (category) => {
    setEditing(category)
    setIsEditModalOpen(true)
  }

  const handleSave = async () => {
    load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa danh mục?')) return
    await categoryService.deleteCategory(id)
    load()
  }

  const filteredCategories = categories.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">

      {/* Search Bar */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Tìm kiếm danh mục..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
         <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center space-x-2"
        >
          <i className="fas fa-plus"></i>
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Tên danh mục</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Mô tả</th>
              <th className="px-4 py-3 text-center font-semibold text-sm text-gray-600">Số lượng SP</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Trạng thái</th>
              <th className="px-4 py-3 text-center font-semibold text-sm text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCategories.map((c) => {
              const count = productCounts[c._id] || 0
              const countClass = count === 0
                ? 'bg-gray-100 text-gray-600'
                : count < 5
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'

              return (
                <tr key={c._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.description || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      title={`${count} sản phẩm`}
                      aria-label={`Số lượng sản phẩm: ${count}`}
                      className={`inline-flex items-center justify-center w-10 h-10 ${countClass} text-sm font-semibold rounded-full shadow-sm ring-1 ring-gray-200 transition transform hover:scale-105`}
                    >
                      {count}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {c.status === 'active' ? '✅ Hoạt động' : '⊘ Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded mr-2 transition" title="Sửa">
                      <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={() => handleDelete(c._id)} className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded transition" title="Xóa">
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddCategoryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSave} />
      <EditCategoryModal
        isOpen={isEditModalOpen}
        category={editing}
        onClose={() => { setIsEditModalOpen(false); setEditing(null); }}
        onSave={handleSave}
      />
    </div>
  )
}

export default Categories
