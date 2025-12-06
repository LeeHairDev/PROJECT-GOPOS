import React, { useState, useEffect } from 'react'
import { warehouseService } from '../services/warehouseService'
import { productService } from '../services/productService'
import { stockService } from '../services/stockService'
import Toast from './Toast'

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    capacity: '',
    description: '',
    manager: '',
  })

  // Import/Export state
  const [activeTab, setActiveTab] = useState('list')
  const [allProducts, setAllProducts] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [supplier, setSupplier] = useState('')
  const [mode, setMode] = useState('import')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchWarehouses()
    fetchAllProducts()
  }, [])

  const fetchWarehouses = async () => {
    setLoading(true)
    try {
      const res = await warehouseService.getAllWarehouses()
      setWarehouses(res.warehouses || [])
    } catch (err) {
      console.error('Error fetching warehouses:', err)
      setToast({ message: 'Lỗi khi tải danh sách kho', type: 'error' })
    }
    setLoading(false)
  }

  const fetchAllProducts = async () => {
    try {
      const res = await productService.getAllProducts(undefined, undefined, 1, 1000)
      if (res && res.products) {
        setAllProducts(res.products)
      } else if (Array.isArray(res)) {
        setAllProducts(res)
      }
    } catch (err) {
      console.error('Error fetching all products:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name) {
      setToast({ message: 'Vui lòng nhập tên kho', type: 'error' })
      return
    }

    try {
      if (editingId) {
        await warehouseService.updateWarehouse(editingId, formData)
        setToast({ message: 'Cập nhật kho thành công!', type: 'success' })
      } else {
        await warehouseService.createWarehouse(formData)
        setToast({ message: 'Tạo kho thành công!', type: 'success' })
      }
      setShowModal(false)
      setEditingId(null)
      setFormData({
        name: '',
        location: '',
        address: '',
        capacity: '',
        description: '',
        manager: '',
      })
      fetchWarehouses()
    } catch (err) {
      console.error('Error saving warehouse:', err)
      setToast({ message: `Lỗi: ${err?.message || 'Không thể lưu kho'}`, type: 'error' })
    }
  }

  const handleEdit = (warehouse) => {
    setEditingId(warehouse._id)
    setFormData({
      name: warehouse.name || '',
      location: warehouse.location || '',
      address: warehouse.address || '',
      capacity: warehouse.capacity || '',
      description: warehouse.description || '',
      manager: warehouse.manager || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa kho này?')) return
    try {
      await warehouseService.deleteWarehouse(id)
      setToast({ message: 'Xóa kho thành công!', type: 'success' })
      fetchWarehouses()
    } catch (err) {
      console.error('Error deleting warehouse:', err)
      setToast({ message: `Lỗi: ${err?.message || 'Không thể xóa kho'}`, type: 'error' })
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      name: '',
      location: '',
      address: '',
      capacity: '',
      description: '',
      manager: '',
    })
  }

  // Import/Export handlers
  const addToSelected = (product) => {
    setSelectedItems(items => {
      const existing = items.find(i => i.product._id === product._id)
      if (existing) {
        return items.map(i => i.product._id === product._id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [{ product, qty: 1 }, ...items]
    })
  }

  const updateQty = (productId, qty) => {
    setSelectedItems(items => items.map(i => i.product._id === productId ? { ...i, qty: Math.max(0, Number(qty) || 0) } : i))
  }

  const removeItem = (productId) => {
    setSelectedItems(items => items.filter(i => i.product._id !== productId))
  }

  const totalImportValue = selectedItems.reduce((s, i) => s + ((i.product.price || 0) * (i.qty || 0)), 0)

  const submitOperation = async () => {
    if (selectedItems.length === 0) {
      setToast({ message: mode === 'import' ? 'Vui lòng thêm ít nhất 1 sản phẩm để nhập kho' : 'Vui lòng thêm ít nhất 1 sản phẩm để xuất kho', type: 'error' })
      return
    }
    const selectedWarehouse = warehouses.find(w => w._id === editingId)
    if (!selectedWarehouse) {
      setToast({ message: 'Vui lòng chọn kho hàng', type: 'error' })
      return
    }
    if (mode === 'import' && !supplier) {
      setToast({ message: 'Vui lòng chọn nhà cung cấp', type: 'error' })
      return
    }
    if (mode === 'export' && !supplier) {
      setToast({ message: 'Vui lòng chọn đơn vị nhận / khách hàng', type: 'error' })
      return
    }

    setSubmitting(true)
    try {
      for (const item of selectedItems) {
        await stockService.createMovement({
          product: item.product._id,
          type: mode === 'import' ? 'in' : 'out',
          quantity: item.qty,
          reference: supplier,
          warehouse: selectedWarehouse._id,
          notes: mode === 'import' ? `Nhập từ: ${supplier} - Kho: ${selectedWarehouse.name}` : `Xuất cho: ${supplier} - Kho: ${selectedWarehouse.name}`
        })
      }
      setToast({ message: mode === 'import' ? 'Nhập kho thành công!' : 'Xuất kho thành công!', type: 'success' })
      setSelectedItems([])
      setSupplier('')
      setEditingId(null)
      setActiveTab('list')
      fetchWarehouses()
      fetchAllProducts()
    } catch (err) {
      console.error('Error submitting operation:', err)
      setToast({ message: `Lỗi: ${err?.message || 'Không thể hoàn thành giao dịch'}`, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6">Đang tải...</div>

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-2 border-b">
        <button 
          onClick={() => { setActiveTab('list'); setEditingId(null); setSelectedItems([]); setSupplier(''); }}
          className={`px-4 py-2 font-medium ${activeTab === 'list' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
          <i className="fas fa-list mr-2"></i>Danh sách kho
        </button>
        <button 
          onClick={() => setActiveTab('transfer')}
          className={`px-4 py-2 font-medium ${activeTab === 'transfer' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
          <i className="fas fa-exchange-alt mr-2"></i>Nhập / Xuất kho
        </button>
      </div>

      {/* List Tab */}
      {activeTab === 'list' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <i className="fas fa-plus mr-2"></i> Thêm kho
            </button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên kho</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa điểm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sức chứa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quản lý</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kho bán</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {warehouses.map((warehouse) => (
                    <tr key={warehouse._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{warehouse.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{warehouse.location || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{warehouse.address || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{warehouse.capacity}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{warehouse.manager || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          warehouse.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {warehouse.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={async () => {
                            try {
                              const res = await warehouseService.setSellingWarehouse(warehouse._id, !warehouse.isSellingWarehouse)
                              setToast({ message: res?.message || 'Cập nhật kho bán thành công', type: 'success' })
                              fetchWarehouses()
                            } catch (err) {
                              console.error('Error toggling selling warehouse', err)
                              setToast({ message: 'Lỗi khi cập nhật kho bán', type: 'error' })
                            }
                          }}
                          className={`px-3 py-1 rounded text-sm font-medium ${warehouse.isSellingWarehouse ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                        >
                          {warehouse.isSellingWarehouse ? 'Đang bán' : 'Bật làm kho bán'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                        <button
                          onClick={() => handleEdit(warehouse)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Sửa"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(warehouse._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Transfer Tab */}
      {activeTab === 'transfer' && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Product cards */}
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-4">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sản phẩm..." 
                  className="flex-1 pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-4">
                {allProducts.map((product) => (
                  <div key={product._id} className="bg-white rounded-lg shadow-sm p-4 border hover:shadow-md transition cursor-pointer" onClick={() => addToSelected(product)}>
                    <div className="h-28 bg-gray-50 rounded mb-3 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="object-contain h-full" />
                      ) : (
                        <i className="fas fa-image text-gray-300 text-2xl"></i>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1 truncate">{product.name}</p>
                      <p className="text-blue-600 font-bold">{(product.price || 0).toLocaleString('vi-VN')} đ</p>
                      <p className="text-xs text-gray-500 mt-2">Kho: {product.warehouse && product.warehouse.name ? product.warehouse.name : (product.quantity || '-')}</p>
                      <p className="text-xs text-gray-500">Mã SP: {product.sku || product._id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form panel */}
            <div className="lg:w-1/3 bg-gray-50 rounded-lg p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold">Thông tin {mode === 'import' ? 'nhập kho' : 'xuất kho'}</h4>
                <select value={mode} onChange={(e) => setMode(e.target.value)} className="border rounded px-2 py-1 text-sm">
                  <option value="import">Nhập kho</option>
                  <option value="export">Xuất kho</option>
                </select>
              </div>

              {mode === 'import' ? (
                <>
                  <label className="text-sm text-gray-600">Nhà cung cấp</label>
                  <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className="border rounded-lg px-3 py-2 mb-3 focus:outline-none">
                    <option value="">-- Chọn nhà cung cấp --</option>
                    <option value="supplier1">Nhà cung cấp A</option>
                    <option value="supplier2">Nhà cung cấp B</option>
                  </select>
                </>
              ) : (
                <>
                  <label className="text-sm text-gray-600">Đơn vị nhận / Khách hàng</label>
                  <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className="border rounded-lg px-3 py-2 mb-3 focus:outline-none">
                    <option value="">-- Chọn đơn vị nhận --</option>
                    <option value="cus1">Khách hàng A</option>
                    <option value="cus2">Khách hàng B</option>
                  </select>
                </>
              )}

              <label className="text-sm text-gray-600">Kho hàng</label>
              <select value={editingId} onChange={(e) => setEditingId(e.target.value)} className="border rounded-lg px-3 py-2 mb-3 focus:outline-none">
                <option value="">-- Chọn kho --</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>

              <div className="flex-1 overflow-y-auto mb-3">
                {selectedItems.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">Chưa có sản phẩm được thêm. Bấm vào sản phẩm bên trái để thêm.</div>
                ) : (
                  <div className="space-y-3">
                    {selectedItems.map(i => (
                      <div key={i.product._id} className="flex items-center justify-between bg-white p-2 rounded shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                            {i.product.image ? <img src={i.product.image} alt="" className="object-contain h-full" /> : <i className="fas fa-box text-gray-300"></i>}
                          </div>
                          <div className="text-sm">
                            <div className="font-medium truncate w-40">{i.product.name}</div>
                            <div className="text-xs text-gray-500">{(i.product.price || 0).toLocaleString('vi-VN')} đ</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="number" value={i.qty} min="0" onChange={(e) => updateQty(i.product._id, e.target.value)} className="w-20 border rounded px-2 py-1 text-sm" />
                          <button onClick={() => removeItem(i.product._id)} className="text-red-600 hover:text-red-800 text-sm">Xóa</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm text-gray-600">Tổng giá trị</div>
                  <div className="font-semibold">{totalImportValue.toLocaleString('vi-VN')} đ</div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => { setSelectedItems([]); setSupplier(''); setEditingId(''); }} className="flex-1 bg-gray-200 py-2 rounded">Hủy</button>
                  <button onClick={submitOperation} disabled={submitting} className={`flex-1 py-2 rounded ${mode === 'import' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'} ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}>{submitting ? 'Đang xử lý...' : (mode === 'import' ? 'Nhập kho' : 'Xuất kho')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{editingId ? 'Chỉnh sửa kho' : 'Thêm kho mới'}</h3>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên kho *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Nhập tên kho"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Địa điểm kho"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Địa chỉ đầy đủ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Sức chứa (tấn hoặc đơn vị khác)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quản lý</label>
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Tên người quản lý"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Mô tả kho hàng"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default Warehouses
