import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import PrintModal from './modals/PrintModal';
import PayDebtModal from './modals/PayDebtModal';
import { exportOrdersToExcel } from '../utils/excelExport';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showPayDebtModal, setShowPayDebtModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const limit = 10;

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrders(undefined, undefined, page, limit);
      if (res && res.orders) {
        setOrders(res.orders);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
    setLoading(false);
  };

  const deleteOrder = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
      try {
        const res = await orderService.deleteOrder(id);
        if (res && res.message) {
          alert('Xóa đơn hàng thành công');
          fetchOrders();
        }
      } catch (err) {
        console.error('Error deleting order:', err);
        alert('Lỗi khi xóa đơn hàng');
      }
    }
  };

  const handlePrint = (order) => {
    setSelectedOrder(order);
    setShowPrintModal(true);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowPrintModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setEditNotes(order.notes || '');
    setShowDetailModal(true);
  };

  const handleOpenPayDebtModal = (order) => {
    setSelectedOrder(order);
    setShowPayDebtModal(true);
  };

  const handleExportExcel = async () => {
    try {
      const res = await orderService.getAllOrders(undefined, undefined, 1, 10000);
      if (res && res.orders) {
        exportOrdersToExcel(res.orders);
      }
    } catch (err) {
      console.error('Error exporting orders:', err);
      alert('Lỗi khi xuất Excel');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '⏳ Chờ xử lý';
      case 'completed':
        return '✅ Hoàn thành';
      case 'cancelled':
        return '❌ Hủy';
      default:
        return status;
    }
  };

  const getDebtBadge = (paymentStatus, debtAmount) => {
    if (paymentStatus === 'paid' || debtAmount === 0) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-orange-100 text-orange-800';
  };

  const getDebtText = (paymentStatus, debtAmount) => {
    if (paymentStatus === 'paid' || debtAmount === 0) {
      return '✅ Đã thanh toán';
    }
    return `🔴 Chưa thanh toán`;
  };

  const maxPages = Math.ceil(total / limit);

  // Filter and sort orders
  const filteredOrders = orders.filter(order => {
    const matchSearch = 
      (order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchPaymentStatus = filterPaymentStatus === 'all' || 
      (filterPaymentStatus === 'paid' && (!order.debt || order.debt === 0)) ||
      (filterPaymentStatus === 'unpaid' && order.debt > 0);
    
    return matchSearch && matchStatus && matchPaymentStatus;
  });

  const applyAdvancedFilters = (ordersToFilter) => {
    let filtered = ordersToFilter;

    // Lọc theo khoảng ngày
    if (filterDateRange !== 'all') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        if (filterDateRange === 'today') {
          return orderDate >= startOfDay;
        } else if (filterDateRange === 'week') {
          return orderDate >= startOfWeek;
        } else if (filterDateRange === 'month') {
          return orderDate >= startOfMonth;
        }
        return true;
      });
    }

    // Sắp xếp
    if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'total-asc') {
      filtered.sort((a, b) => (a.total || 0) - (b.total || 0));
    } else if (sortBy === 'total-desc') {
      filtered.sort((a, b) => (b.total || 0) - (a.total || 0));
    }

    return filtered;
  };

  const getOrderStats = () => {
    const filtered = applyAdvancedFilters(filteredOrders);
    return {
      total: filtered.length,
      pending: filtered.filter(o => o.status === 'pending').length,
      completed: filtered.filter(o => o.status === 'completed').length,
      cancelled: filtered.filter(o => o.status === 'cancelled').length,
      totalValue: filtered.reduce((sum, o) => sum + (o.total || 0), 0),
      unpaidDebt: filtered.reduce((sum, o) => sum + (o.debt || 0), 0),
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
       
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Advanced Filter Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium transition"
          >
            <i className={`fas fa-sliders-h ${showAdvancedFilter ? 'rotate-180' : ''}`}></i>
            {showAdvancedFilter ? 'Ẩn bộ lọc' : 'Hiện bộ lọc nâng cao'}
          </button>
          {(filterStatus !== 'all' || filterPaymentStatus !== 'all' || filterDateRange !== 'all') && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              Đang lọc dữ liệu
            </span>
          )}
        </div>

        {/* Advanced Filter Panel */}
        {showAdvancedFilter && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Trạng thái đơn */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-tasks mr-2"></i>Trạng thái đơn
              </label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">⏳ Chờ xử lý</option>
                <option value="completed">✅ Hoàn thành</option>
                <option value="cancelled">❌ Hủy</option>
              </select>
            </div>

            {/* Thanh toán */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-credit-card mr-2"></i>Thanh toán
              </label>
              <select
                value={filterPaymentStatus}
                onChange={(e) => { setFilterPaymentStatus(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tất cả</option>
                <option value="paid">✅ Đã thanh toán</option>
                <option value="unpaid">❌ Chưa thanh toán</option>
              </select>
            </div>

            {/* Khoảng ngày */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-calendar mr-2"></i>Khoảng ngày
              </label>
              <select
                value={filterDateRange}
                onChange={(e) => { setFilterDateRange(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
              </select>
            </div>

            {/* Sắp xếp */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-sort mr-2"></i>Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="latest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="total-asc">Giá: Thấp {"→"} Cao</option>
                <option value="total-desc">Giá: Cao {"→"} Thấp</option>
              </select>
            </div>
          </div>
        )}

        {/* Filter Stats */}
        {(filterStatus !== 'all' || filterPaymentStatus !== 'all' || filterDateRange !== 'all') && (
          <div className="mb-4 grid grid-cols-2 md:grid-cols-6 gap-3">
            {(() => {
              const stats = getOrderStats();
              return (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-xs text-blue-600 font-semibold">Tổng đơn</div>
                    <div className="text-xl font-bold text-blue-700">{stats.total}</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-xs text-yellow-600 font-semibold">Chờ xử lý</div>
                    <div className="text-xl font-bold text-yellow-700">{stats.pending}</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-xs text-green-600 font-semibold">Hoàn thành</div>
                    <div className="text-xl font-bold text-green-700">{stats.completed}</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-xs text-red-600 font-semibold">Hủy</div>
                    <div className="text-xl font-bold text-red-700">{stats.cancelled}</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-xs text-purple-600 font-semibold">Tổng giá trị</div>
                    <div className="text-lg font-bold text-purple-700">{(stats.totalValue / 1000000).toFixed(1)}M</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="text-xs text-orange-600 font-semibold">Nợ chưa trả</div>
                    <div className="text-lg font-bold text-orange-700">{(stats.unpaidDebt / 1000000).toFixed(1)}M</div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Search & Filter */}
        <div className="mb-6 flex gap-3">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="🔍 Tìm kiếm theo tên khách hàng hoặc mã hóa đơn..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={handleExportExcel}
            className="btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center whitespace-nowrap"
          >
            <i className="fas fa-download mr-2"></i> Xuất Excel
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : applyAdvancedFilters(filteredOrders).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <i className="fas fa-inbox text-4xl mb-4"></i>
            <p>Không có đơn hàng phù hợp với tiêu chí lọc</p>
          </div>
        ) : (
          <>
            {/* Thống kê */}
            <div className="mb-4 text-sm text-gray-600">
              Tìm thấy <span className="font-bold text-blue-600">{applyAdvancedFilters(filteredOrders).length}</span> đơn hàng
            </div>

            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã hóa đơn</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tình trạng thanh toán</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applyAdvancedFilters(filteredOrders).map((order, index) => (
                    <React.Fragment key={order._id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">{index + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium cursor-pointer hover:text-blue-600" onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}>
                          {order.orderNumber}
                          <i className={`fas fa-chevron-down ml-2 transition ${expandedOrderId === order._id ? 'rotate-180' : ''}`}></i>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>
                            <p className="font-medium">{order.customerName || 'Khách lẻ'}</p>
                            {order.customerPhone && <p className="text-xs text-gray-500">📱 {order.customerPhone}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{order.finalTotal?.toLocaleString()} VND</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDebtBadge(order.paymentStatus, order.debtAmount)}`}>
                            {getDebtText(order.paymentStatus, order.debtAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {order.paymentStatus !== 'paid' && (order.isDebt || order.debtAmount > 0) && (
                              <button 
                                onClick={() => handleOpenPayDebtModal(order)} 
                                className="text-orange-600 hover:text-orange-900 hover:bg-orange-50 p-2 rounded transition" 
                                title="Thanh toán nợ"
                              >
                                <i className="fas fa-money-bill"></i>
                              </button>
                            )}
                            <button 
                              onClick={() => handleViewOrder(order)} 
                              className="text-green-600 hover:text-green-900 hover:bg-green-50 p-2 rounded transition" 
                              title="Xem chi tiết"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button onClick={() => deleteOrder(order._id)} className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded transition" title="Xóa">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded row with order items and images */}
                      {expandedOrderId === order._id && (
                        <tr className="bg-gray-50">
                          <td colSpan="6" className="px-4 py-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-700">Chi tiết sản phẩm</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition">
                                    <div className="relative bg-gray-100 h-32 flex items-center justify-center overflow-hidden">
                                      {item.image ? (
                                        <img 
                                          src={item.image} 
                                          alt={item.productName}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="text-gray-400 text-center">
                                          <i className="fas fa-image text-4xl mb-2"></i>
                                          <p className="text-xs">Không ảnh</p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="p-3">
                                      <p className="font-semibold text-gray-800 line-clamp-1">{item.productName}</p>
                                      <p className="text-sm text-gray-600">Số lượng: <span className="font-medium">{item.quantity}</span></p>
                                      <p className="text-sm text-gray-600">Đơn giá: <span className="font-medium">{item.price?.toLocaleString()} VND</span></p>
                                      <p className="text-sm text-blue-600 font-semibold mt-1">Thành tiền: {(item.price * item.quantity)?.toLocaleString()} VND</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Hiển thị <span className="font-medium">{(page - 1) * limit + 1}</span> đến <span className="font-medium">{Math.min(page * limit, total)}</span> của <span className="font-medium">{total}</span> kết quả</span>
              </div>
              <div className="flex space-x-1">
                <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                  <i className="fas fa-chevron-left"></i>
                </button>
                {Array.from({ length: Math.min(5, maxPages) }, (_, i) => (
                  <button 
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded-lg ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(Math.min(maxPages, page + 1))} disabled={page === maxPages} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Print Modal */}
      <PrintModal 
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        order={selectedOrder}
      />

      <PayDebtModal
        isOpen={showPayDebtModal}
        onClose={() => setShowPayDebtModal(false)}
        order={selectedOrder}
        onSuccess={fetchOrders}
      />
    </div>
  );
};

export default Orders;
