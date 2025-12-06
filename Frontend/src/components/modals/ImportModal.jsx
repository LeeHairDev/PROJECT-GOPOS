import React, { useEffect, useState } from 'react'
import { productService } from '../../services/productService'
import { stockService } from '../../services/stockService'
import { customerService } from '../../services/customerService'

const ImportModal = ({ isOpen, onClose, onSave, initialProductId }) => {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState({ reference: '', supplier: '', product: '', quantity: 0, price: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    ;(async () => {
      try {
        const p = await productService.getAllProducts(undefined, undefined, 1, 1000)
        setProducts(p?.products || [])
        const c = await customerService.getAllCustomers()
        const list = (c?.value || c?.customers || c || []).filter((x) => x.type === 'supplier' || x.type === 'both')
        setSuppliers(list)
        // If an initial product id is provided, preselect it
        if (initialProductId) {
          setForm(f => ({ ...f, product: initialProductId }))
        }
      } catch (err) {
        console.error('Error loading products/customers for import modal', err)
      }
    })()
  }, [isOpen])

  // If initialProductId changes while modal is open, update the form
  useEffect(() => {
    if (!isOpen) return
    if (initialProductId) {
      setForm(f => ({ ...f, product: initialProductId }))
    }
  }, [initialProductId, isOpen])

  if (!isOpen) return null

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.product || !form.quantity) {
      alert('Vui lòng chọn sản phẩm và số lượng')
      return
    }
    setLoading(true)
    try {
      const payload = {
        product: form.product,
        type: 'in',
        quantity: Number(form.quantity),
        reference: form.reference || 'IMPORT',
      }
      if (form.supplier) payload.customer = form.supplier
      await stockService.createMovement(payload)
      setForm({ reference: '', supplier: '', product: '', quantity: 0, price: 0 })
      onSave && onSave()
      onClose && onClose()
    } catch (err) {
      console.error('Import error', err)
      alert('Nhập kho thất bại: ' + (err?.message || ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Nhập kho</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã lô hàng</label>
              <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Nhập mã lô hàng" value={form.reference} onChange={handleChange('reference')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp</label>
              <select className="w-full border rounded-lg px-3 py-2" value={form.supplier} onChange={handleChange('supplier')}>
                <option value="">-- Chọn nhà cung cấp (tuỳ chọn) --</option>
                {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm</label>
              <select className="w-full border rounded-lg px-3 py-2" value={form.product} onChange={handleChange('product')}>
                <option value="">-- Chọn sản phẩm --</option>
                {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2" placeholder="Nhập số lượng" value={form.quantity} onChange={handleChange('quantity')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đơn giá</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2" placeholder="Nhập đơn giá" value={form.price} onChange={handleChange('price')} />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg">Hủy</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">{loading ? 'Đang xử lý...' : 'Lưu'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ImportModal