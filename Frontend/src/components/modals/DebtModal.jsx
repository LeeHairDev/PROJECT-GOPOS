import React, { useEffect, useState } from 'react'
import { customerService } from '../../services/customerService'

const DebtModal = ({ isOpen, onClose, onSave, customer }) => {
  const [form, setForm] = useState({ amount: 0, type: 'add', note: '' })
  const [loading, setLoading] = useState(false)
  const [debtHistory, setDebtHistory] = useState([])

  useEffect(() => {
    if (!isOpen || !customer) return
    setDebtHistory(customer.debtHistory || [])
  }, [isOpen, customer])

  if (!isOpen || !customer) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount) {
      alert('Vui lòng nhập số tiền')
      return
    }

    setLoading(true)
    try {
      const payload = {
        type: form.type,
        amount: form.amount,
        note: form.note
      }

      // Call update debt API
      const response = await fetch(`http://localhost:5000/api/customers/${customer._id}/debt`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Lỗi cập nhật công nợ')
      }

      setForm({ amount: 0, type: 'add', note: '' })
      onSave && onSave()
      onClose && onClose()
      alert('Cập nhật công nợ thành công!')
    } catch (err) {
      console.error('Error updating debt:', err)
      alert('Lỗi: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Quản lý công nợ - {customer.name}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Công nợ hiện tại</label>
                  <div className="px-3 py-2 bg-gray-50 border rounded-lg font-semibold text-red-600">
                    {customer.debt?.toLocaleString('vi-VN')} VND
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại giao dịch</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="add">➕ Tăng nợ (bán nợ)</option>
                    <option value="payment">✅ Thanh toán (giảm nợ)</option>
                    <option value="cancel">❌ Hủy/Cộng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Nhập số tiền"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Ghi chú lý do (tuỳ chọn)"
                    className="w-full border rounded-lg px-3 py-2 h-20"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg">
                    Hủy
                  </button>
                  <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Đang xử lý...' : 'Cập nhật'}
                  </button>
                </div>
              </form>
            </div>

            {/* History */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Lịch sử công nợ</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {!debtHistory || debtHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm">Không có lịch sử</p>
                ) : (
                  debtHistory.map((entry, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {entry.type === 'add' ? '➕ Tăng nợ' : entry.type === 'payment' ? '✅ Thanh toán' : '❌ Hủy'}
                          </p>
                          <p className="text-sm text-gray-600">{entry.description}</p>
                        </div>
                        <span className={`font-semibold ${entry.type === 'add' ? 'text-red-600' : 'text-green-600'}`}>
                          {entry.type === 'add' ? '+' : '-'}{entry.amount?.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                      {entry.note && <p className="text-xs text-gray-500 mt-1">Ghi chú: {entry.note}</p>}
                      <p className="text-xs text-gray-400 mt-1">{new Date(entry.date).toLocaleString('vi-VN')}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebtModal
