import React, { useState, useEffect } from 'react'
import { productService } from '../services/productService'
import { warehouseService } from '../services/warehouseService'
import Toast from './Toast'

const ProductStockPanel = ({ product, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState(null)
  const [warehouses, setWarehouses] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [outOfStockWarehouse, setOutOfStockWarehouse] = useState(null)

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        warehouse: product.warehouse?._id || product.warehouse || '',
      })
      fetchWarehouses()
    }
  }, [isOpen, product])

  const fetchWarehouses = async () => {
    try {
      const res = await warehouseService.getAllWarehouses()
      if (res && res.warehouses) {
        setWarehouses(res.warehouses)
        // Find out-of-stock warehouse
        const outOfStock = res.warehouses.find((w) =>
          w.name.toLowerCase().includes('tạm dừng') || 
          w.name.toLowerCase().includes('không bán') ||
          w.name.toLowerCase().includes('out of stock') ||
          w.name.toLowerCase().includes('kho tạm')
        )
        setOutOfStockWarehouse(outOfStock || null)
      }
    } catch (err) {
      console.error('Error fetching warehouses:', err)
      setToast({ message: 'Lỗi tải danh sách kho', type: 'error' })
    }
  }

  const handleWarehouseChange = async (e) => {
    const newWarehouseId = e.target.value
    setFormData({ ...formData, warehouse: newWarehouseId })

    if (!newWarehouseId) return

    setLoading(true)
    // Ensure user is authenticated (frontend stores token)
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      try { window.alert('Bạn cần đăng nhập để thực hiện thao tác này.') } catch (e) {}
      return
    }

    try {
      console.log('Sending updateProduct request', product._id, { warehouse: newWarehouseId })
      const res = await productService.updateProduct(product._id, {
        warehouse: newWarehouseId,
      })
      if (res && res.product) {
        console.log('Update warehouse success', res)
        setToast({ message: 'Cập nhật kho hàng thành công!', type: 'success' })
        // visible fallback
        try { window.alert('Cập nhật kho hàng thành công!') } catch (e) {}
        if (onUpdate) onUpdate(res.product)
      }
    } catch (err) {
      console.error('Error updating product warehouse:', err)
      console.error(err)
      setToast({ message: `Lỗi: ${err?.message || 'Không thể cập nhật kho'}`, type: 'error' })
      try { window.alert(`Lỗi: ${err?.message || 'Không thể cập nhật kho'}`) } catch (e) {}
      // Revert on error
      setFormData({
        warehouse: product.warehouse?._id || product.warehouse || '',
      })
    }
    setLoading(false)
  }

  const toggleOutOfStock = async () => {
    if (!outOfStockWarehouse) {
      setToast({ message: 'Chưa có kho tạm dừng bán. Vui lòng tạo kho "Kho tạm dừng bán" trước.', type: 'error' })
      return
    }

    const isCurrentlyOutOfStock = formData.warehouse === outOfStockWarehouse._id
    const salesWarehouse = warehouses.find(w => w.name.toLowerCase().includes('bán hàng') || w.name.toLowerCase().includes('bán')) 
    const targetWarehouseId = isCurrentlyOutOfStock ? (salesWarehouse?._id || warehouses[0]._id) : outOfStockWarehouse._id

    // Ensure user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      try { window.alert('Bạn cần đăng nhập để thực hiện thao tác này.') } catch (e) {}
      return
    }

    setLoading(true)
    try {
      console.log('Toggling out-of-stock for', product._id, 'target:', targetWarehouseId)
      const res = await productService.updateProduct(product._id, {
        warehouse: targetWarehouseId,
      })
      if (res && res.product) {
        const action = isCurrentlyOutOfStock ? 'Quay lại kho bán' : 'Chuyển tạm dừng bán'
        console.log('Toggle out-of-stock success', res)
        setToast({ message: `${action} thành công!`, type: 'success' })
        try { window.alert(`${action} thành công!`) } catch (e) {}
        setFormData({ ...formData, warehouse: targetWarehouseId })
        if (onUpdate) onUpdate(res.product)
      }
    } catch (err) {
      console.error('Error toggling out of stock:', err)
      console.error(err)
      setToast({ message: `Lỗi: ${err?.message || 'Không thể cập nhật'}`, type: 'error' })
      try { window.alert(`Lỗi: ${err?.message || 'Không thể cập nhật'}`) } catch (e) {}
    }
    setLoading(false)
  }

  const toggleSaleStatus = async () => {
    // toggle active/inactive
    const newStatus = product.status === 'inactive' ? 'active' : 'inactive'

    const token = localStorage.getItem('token')
    if (!token) {
      try { window.alert('Bạn cần đăng nhập để thực hiện thao tác này.') } catch (e) {}
      return
    }

    setLoading(true)
    try {
      const res = await productService.updateProduct(product._id, { status: newStatus })
      if (res && res.product) {
        setToast({ message: `Cập nhật trạng thái bán: ${newStatus}`, type: 'success' })
        try { window.alert(`Cập nhật trạng thái bán: ${newStatus}`) } catch (e) {}
        if (onUpdate) onUpdate(res.product)
      }
    } catch (err) {
      console.error('Error toggling sale status', err)
      setToast({ message: `Lỗi: ${err?.message || 'Không thể cập nhật'}`, type: 'error' })
      try { window.alert(`Lỗi: ${err?.message || 'Không thể cập nhật'}`) } catch (e) {}
    }
    setLoading(false)
  }

  if (!isOpen || !product || !formData) return null

  const currentWarehouse = warehouses.find((w) => w._id === formData.warehouse)

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto flex items-center justify-center z-50 p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Chi tiết tồn kho</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Product Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                    <i className="fas fa-image"></i>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{product.name}</p>
                  <p className="text-sm text-gray-500">SKU: {product.sku || '-'}</p>
                  <p className="text-sm text-gray-500">
                    Giá: {(product.price || 0).toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>
            </div>

            {/* Stock Info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Tổng tồn kho</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {product.quantity || 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Mã sản phẩm</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {product._id.substring(0, 8)}...
                  </p>
                </div>
              </div>
            </div>

            {/* Current Warehouse */}
            {currentWarehouse && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-2">Kho hàng hiện tại</p>
                <p className="font-semibold text-green-700">{currentWarehouse.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {currentWarehouse.location || '-'}
                </p>
              </div>
            )}

            {/* Warehouse Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn kho hàng
              </label>
              <select
                value={formData.warehouse}
                onChange={handleWarehouseChange}
                disabled={loading}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">-- Chọn kho hàng --</option>
                {warehouses.map((wh) => (
                  <option key={wh._id} value={wh._id}>
                    {wh.name} ({wh.location || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse List */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Danh sách kho</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {warehouses.map((wh) => (
                  <button
                    key={wh._id}
                    onClick={() => {
                      setFormData({ ...formData, warehouse: wh._id })
                      handleWarehouseChange({
                        target: { value: wh._id },
                      })
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      formData.warehouse === wh._id
                        ? 'bg-blue-100 border-blue-500 text-blue-900'
                        : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{wh.name}</p>
                        <p className="text-xs text-gray-500">{wh.location || '-'}</p>
                      </div>
                      {formData.warehouse === wh._id && (
                        <i className="fas fa-check text-blue-600"></i>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Out of Stock Toggle */}
            {outOfStockWarehouse && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-gray-600 mb-3">Tạm dừng bán</p>
                <button
                  onClick={toggleOutOfStock}
                  disabled={loading}
                  className={`w-full py-2 rounded-lg font-medium transition disabled:opacity-50 ${
                    formData.warehouse === outOfStockWarehouse._id
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  <i className={`fas ${formData.warehouse === outOfStockWarehouse._id ? 'fa-undo' : 'fa-ban'} mr-2`}></i>
                  {formData.warehouse === outOfStockWarehouse._id ? 'Quay lại kho bán' : 'Tạm dừng bán hàng'}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.warehouse === outOfStockWarehouse._id
                    ? 'Sản phẩm đang tạm dừng bán. Bấm để quay lại kho bán.'
                    : 'Chuyển sản phẩm này sang kho tạm dừng bán (không thể bán được).'}
                </p>
              </div>
            )}

            {/* Sale Status Toggle */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Trạng thái bán</p>
              <button
                onClick={toggleSaleStatus}
                disabled={loading}
                className={`w-full py-2 rounded-lg font-medium transition disabled:opacity-50 ${
                  product.status === 'inactive' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <i className={`fas ${product.status === 'inactive' ? 'fa-check' : 'fa-times'} mr-2`}></i>
                {product.status === 'inactive' ? 'Bật bán (Cho phép bán lại)' : 'Tắt bán (Không cho bán)'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                {product.status === 'inactive'
                  ? 'Sản phẩm đang bị tắt bán và sẽ không xuất hiện khi chọn hàng để bán.'
                  : 'Sản phẩm đang bật bán.'}
              </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductStockPanel
