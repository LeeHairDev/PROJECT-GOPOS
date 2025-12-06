import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';

const PayDebtModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && order) {
      setPaymentAmount(order.debtAmount || 0);
      setPaymentMethod('cash');
      setNotes('');
      setError('');
    }
  }, [isOpen, order]);

  const handlePayment = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      setError('Vui lòng nhập số tiền thanh toán');
      return;
    }

    if (paymentAmount > (order.debtAmount || 0)) {
      setError('Số tiền thanh toán không thể vượt quá số nợ');
      return;
    }

    setLoading(true);
    try {
      console.log('Updating order:', order._id, {
        status: 'completed',
        paymentStatus: 'paid',
        notes: notes || order.notes,
      });

      // Cập nhật trạng thái đơn hàng và thanh toán nợ
      // Backend sẽ tự cập nhật công nợ khách hàng khi paymentStatus = 'paid'
      const response = await orderService.updateOrder(order._id, {
        status: 'completed',
        paymentStatus: 'paid',
        notes: notes || order.notes,
      });

      console.log('Update response:', response);

      if (response && response.message) {
        alert('✅ Thanh toán nợ thành công!');
      }

      setError('');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Lỗi khi xử lý thanh toán: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">💳 Thanh toán nợ</h2>

        {/* Order Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm"><strong>Mã đơn:</strong> {order.orderNumber}</p>
          <p className="text-sm"><strong>Khách hàng:</strong> {order.customerName || 'Khách lẻ'}</p>
          <p className="text-sm"><strong>Số nợ:</strong> <span className="text-red-600 font-bold">{(order.debtAmount || 0).toLocaleString('vi-VN')} VND</span></p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Payment Amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Số tiền thanh toán *</label>
          <input
            type="number"
            min="0"
            max={order.debtAmount || 0}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(Math.min(Math.max(parseFloat(e.target.value) || 0, 0), order.debtAmount || 0))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập số tiền thanh toán"
          />
          <p className="text-xs text-gray-500 mt-1">Tối đa: {(order.debtAmount || 0).toLocaleString('vi-VN')} VND</p>
        </div>

        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Phương thức thanh toán *</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="cash">💵 Tiền mặt</option>
            <option value="card">💳 Thẻ</option>
            <option value="bank_transfer">🏦 Chuyển khoản</option>
            <option value="other">📱 Khác</option>
          </select>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Ghi chú</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="Thêm ghi chú..."
          />
        </div>

        {/* Summary */}
        <div className="mb-6 p-3 bg-blue-50 rounded border border-blue-200">
          <div className="flex justify-between text-sm mb-2">
            <span>Số nợ:</span>
            <span className="font-semibold">{(order.debtAmount || 0).toLocaleString('vi-VN')} VND</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span>Thanh toán:</span>
            <span className="font-semibold text-green-600">{paymentAmount.toLocaleString('vi-VN')} VND</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-sm">
            <span><strong>Còn nợ:</strong></span>
            <span className={`font-bold ${((order.debtAmount || 0) - paymentAmount) > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {(((order.debtAmount || 0) - paymentAmount)).toLocaleString('vi-VN')} VND
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            onClick={handlePayment}
            disabled={loading || paymentAmount <= 0}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-semibold transition"
          >
            {loading ? 'Đang xử lý...' : '✅ Xác nhận thanh toán'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayDebtModal;
