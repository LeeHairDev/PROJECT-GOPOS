import React from 'react';

const PrintModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('vi-VN');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center print:bg-white print:p-0">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-screen overflow-y-auto print:max-h-none print:rounded-none print:shadow-none print:p-0">
        {/* Print Header */}
        <div className="mb-4 print:mb-2">
          <div className="flex justify-between items-start print:block">
            <div className="flex items-center">
              <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mr-2">
                <i className="fas fa-pills text-blue-600 text-sm"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-blue-600">GoPOS</h1>
                <p className="text-gray-600 text-xs">Hệ thống quản lý bán hàng</p>
              </div>
            </div>
            <div className="text-right print:text-left print:mt-2">
              <h2 className="text-lg font-bold">HÓA ĐƠN BÁN HÀNG</h2>
              <p className="text-xs text-gray-600">Số HĐ: {order._id?.substring(0, 8) || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 print:gap-2 print:mb-3">
          <div>
            <h3 className="font-bold text-xs mb-1">Thông tin khách hàng:</h3>
            <p className="text-xs"><span className="font-medium">Họ tên:</span> {order.customerName || order.customerInfo?.customerName || 'Không có tên'}</p>
            <p className="text-xs"><span className="font-medium">Điện thoại:</span> {order.customerPhone || order.customerInfo?.customerPhone || 'N/A'}</p>
            <p className="text-xs"><span className="font-medium">Địa chỉ:</span> {order.notes || order.customerInfo?.notes || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-bold text-xs mb-1">Thông tin hóa đơn:</h3>
            <p className="text-xs"><span className="font-medium">Ngày:</span> {formatDate(order.createdAt)}</p>
            <p className="text-sm"><span className="font-medium">Thời gian:</span> {formatTime(order.createdAt)}</p>
            <p className="text-sm"><span className="font-medium">Trạng thái:</span> 
              <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                order.paymentStatus === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.paymentStatus === 'paid' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
              </span>
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-4 print:mb-3">
          <h3 className="font-bold text-xs mb-2">Chi tiết sản phẩm:</h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="text-left py-1 font-bold">Sản phẩm</th>
                <th className="text-center py-1 font-bold">SL</th>
                <th className="text-right py-1 font-bold">Đơn giá</th>
                <th className="text-right py-1 font-bold">T.tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items && order.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-1 font-medium">
                    {item.productName || item.name || item.product?.name || 'Sản phẩm không xác định'}
                  </td>
                  <td className="text-center py-3">{item.quantity}</td>
                  <td className="text-right py-3">{(item.price || item.product?.price || 0).toLocaleString('vi-VN')} VND</td>
                  <td className="text-right py-3 font-medium">{((item.quantity || 1) * (item.price || item.product?.price || 0)).toLocaleString('vi-VN')} VND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="bg-gray-50 p-2 rounded-lg mb-4 print:bg-white print:mb-3 print:p-1 print:rounded-none">
          <div className="flex justify-end">
            <div className="w-full md:w-80">
              <div className="flex justify-between mb-1 text-xs">
                <span>Tổng cộng:</span>
                <span className="font-medium">{(order.subtotal || 0).toLocaleString('vi-VN')} VND</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between mb-1 text-green-600 text-xs">
                  <span>Giảm giá ({order.discountPercent || 0}%):</span>
                  <span className="font-medium">-{(order.discount || 0).toLocaleString('vi-VN')} VND</span>
                </div>
              )}
              <div className="flex justify-between mb-1 text-xs">
                <span>Thuế ({order.taxPercent || 10}%):</span>
                <span className="font-medium">{(order.tax || 0).toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex justify-between border-t-2 border-gray-800 pt-2 text-lg">
                <span className="font-bold">Tổng cộng:</span>
                <span className="font-bold text-blue-600">{(order.finalTotal || 0).toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mb-8 print:mb-4">
          <p>Cảm ơn quý khách đã mua hàng!</p>
          <p>Để hoàn trả hàng, vui lòng mang theo hóa đơn này trong vòng 7 ngày</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-end print:hidden">
          <button
            onClick={handlePrint}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <i className="fas fa-print"></i> In hóa đơn
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none;
          }
          .print\\:bg-white {
            background-color: white;
          }
          .print\\:p-0 {
            padding: 0;
          }
          .print\\:block {
            display: block;
          }
          .print\\:mt-4 {
            margin-top: 1rem;
          }
          .print\\:rounded-none {
            border-radius: 0;
          }
          .print\\:shadow-none {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintModal;
