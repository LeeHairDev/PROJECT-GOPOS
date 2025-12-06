import React, { useEffect, useState } from 'react';
import { customerService } from '../services/customerService';
import EditCustomerModal from './modals/EditCustomerModal';
import AddCustomerModal from './modals/AddCustomerModal';
import DebtModal from './modals/DebtModal';
import { getAvatarUrl } from '../utils/avatarHelper';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [selectedCustomerForDebt, setSelectedCustomerForDebt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterDebt, setFilterDebt] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const load = async () => {
    const res = await customerService.getAllCustomers();
    setCustomers(res || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa khách hàng?')) return;
    await customerService.deleteCustomer(id);
    load();
  };

  const openEdit = (customer) => {
    setEditing(customer);
    setIsEditModalOpen(true);
  };

  const openDebtModal = (customer) => {
    setSelectedCustomerForDebt(customer);
    setIsDebtModalOpen(true);
  };

  const handleSave = async () => {
    load();
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const applyFilters = (customersToFilter) => {
    let filtered = customersToFilter;

    // Lọc theo loại khách hàng
    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.type === filterType);
    }

    // Lọc theo công nợ
    if (filterDebt !== 'all') {
      if (filterDebt === 'hasdebt') {
        filtered = filtered.filter(c => c.debt > 0);
      } else if (filterDebt === 'nodebt') {
        filtered = filtered.filter(c => !c.debt || c.debt === 0);
      } else if (filterDebt === 'highdebt') {
        filtered = filtered.filter(c => c.debt > 1000000);
      }
    }

    // Sắp xếp
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortBy === 'debt') {
      filtered.sort((a, b) => (b.debt || 0) - (a.debt || 0));
    } else if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  };

  const getCustomerStats = () => {
    const filtered = applyFilters(filteredCustomers);
    return {
      total: filtered.length,
      customers: filtered.filter(c => c.type === 'customer' || c.type === 'both').length,
      suppliers: filtered.filter(c => c.type === 'supplier' || c.type === 'both').length,
      withDebt: filtered.filter(c => c.debt > 0).length,
      totalDebt: filtered.reduce((sum, c) => sum + (c.debt || 0), 0),
    };
  };

  return (
    <div className="p-6">
      {/* Advanced Filter Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium transition"
        >
          <i className={`fas fa-sliders-h ${showAdvancedFilter ? 'rotate-180' : ''}`}></i>
          {showAdvancedFilter ? 'Ẩn bộ lọc' : 'Hiện bộ lọc nâng cao'}
        </button>
        {(filterType !== 'all' || filterDebt !== 'all') && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Đang lọc dữ liệu
          </span>
        )}
      </div>

      {/* Advanced Filter Panel */}
      {showAdvancedFilter && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Loại khách hàng */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-users mr-2"></i>Loại khách hàng
            </label>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="customer">👤 Khách hàng</option>
              <option value="supplier">🏢 Nhà cung cấp</option>
              <option value="both">📋 Cả hai</option>
            </select>
          </div>

          {/* Công nợ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-hand-holding-usd mr-2"></i>Công nợ
            </label>
            <select
              value={filterDebt}
              onChange={(e) => { setFilterDebt(e.target.value); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tất cả</option>
              <option value="nodebt">✅ Không nợ</option>
              <option value="hasdebt">⚠️ Có nợ</option>
              <option value="highdebt">🔴 Nợ {">"} 1M</option>
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
              <option value="name">Theo tên A-Z</option>
              <option value="debt">Công nợ (cao → thấp)</option>
              <option value="latest">Mới nhất</option>
            </select>
          </div>
        </div>
      )}

      {/* Filter Stats */}
      {(filterType !== 'all' || filterDebt !== 'all') && (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          {(() => {
            const stats = getCustomerStats();
            return (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-600 font-semibold">Tổng cộng</div>
                  <div className="text-xl font-bold text-blue-700">{stats.total}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xs text-green-600 font-semibold">Khách hàng</div>
                  <div className="text-xl font-bold text-green-700">{stats.customers}</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-xs text-purple-600 font-semibold">NCC</div>
                  <div className="text-xl font-bold text-purple-700">{stats.suppliers}</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-xs text-yellow-600 font-semibold">Có nợ</div>
                  <div className="text-xl font-bold text-yellow-700">{stats.withDebt}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-xs text-red-600 font-semibold">Tổng nợ</div>
                  <div className="text-lg font-bold text-red-700">{(stats.totalDebt / 1000000).toFixed(1)}M</div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-4 flex gap-4">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên, email, điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center space-x-2 whitespace-nowrap"
        >
          <i className="fas fa-plus"></i>
          <span>Thêm khách hàng</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Avatar</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Tên</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Điện thoại</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Địa chỉ</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Loại</th>
              <th className="px-4 py-3 text-right font-semibold text-sm text-gray-600">Công nợ</th>
              <th className="px-4 py-3 text-center font-semibold text-sm text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {applyFilters(filteredCustomers).length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                  <i className="fas fa-inbox mr-2"></i>Không có khách hàng phù hợp
                </td>
              </tr>
            ) : (
              applyFilters(filteredCustomers).map((c) => (
              <tr key={c._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="group relative inline-block">
                    <img 
                      src={getAvatarUrl(c.avatar)} 
                      alt={c.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 hover:border-blue-400 transition cursor-pointer"
                    />
                    {/* Hover preview */}
                    <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition z-10 pointer-events-none group-hover:pointer-events-auto">
                      <img 
                        src={getAvatarUrl(c.avatar)} 
                        alt={c.name}
                        className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300 shadow-lg bg-white"
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.email}</td>
                <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                <td className="px-4 py-3 text-gray-600 truncate">{c.address}</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                    {c.type === 'customer' ? '👤 Khách' : c.type === 'supplier' ? '🏢 NCC' : '📋 Cả hai'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openDebtModal(c)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                      c.debt > 0
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {c.debt ? c.debt.toLocaleString('vi-VN') + ' VND' : 'Không nợ'}
                  </button>
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
            ))
            )}
          </tbody>
        </table>
      </div>

      <AddCustomerModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSave} />
      <EditCustomerModal
        isOpen={isEditModalOpen}
        customer={editing}
        onClose={() => { setIsEditModalOpen(false); setEditing(null); }}
        onSave={handleSave}
      />
      <DebtModal
        isOpen={isDebtModalOpen}
        customer={selectedCustomerForDebt}
        onClose={() => { setIsDebtModalOpen(false); setSelectedCustomerForDebt(null); }}
        onSave={handleSave}
      />
    </div>
  );
};

export default Customers;
