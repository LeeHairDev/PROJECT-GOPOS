import React, { useEffect, useState } from 'react'
import { userService } from '../services/userService'
import EditEmployeeModal from './modals/EditEmployeeModal'
import AddEmployeeModal from './modals/AddEmployeeModal'
import { getAvatarUrl } from '../utils/avatarHelper'

const Employees = () => {
  const [users, setUsers] = useState([])
  const [editing, setEditing] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false)
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const load = async () => {
    setLoading(true)
    try {
      const res = await userService.getAllUsers()
      const data = res?.value || res?.users || []
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading employees:', err)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openEdit = (u) => { setEditing(u); setIsEditModalOpen(true) }

  const handleSave = async () => {
    load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xác nhận xóa nhân viên này?')) return
    try {
      await userService.deleteUser(id)
      load()
    } catch (err) {
      alert('Lỗi khi xóa nhân viên: ' + (err.message || 'Unknown error'))
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const applyFilters = (usersToFilter) => {
    let filtered = usersToFilter;

    // Lọc theo vai trò
    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    // Lọc theo trạng thái
    if (filterStatus !== 'all') {
      filtered = filtered.filter(u => u.status === filterStatus);
    }

    // Sắp xếp
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortBy === 'email') {
      filtered.sort((a, b) => a.email.localeCompare(b.email));
    } else if (sortBy === 'role') {
      filtered.sort((a, b) => a.role.localeCompare(b.role));
    }

    return filtered;
  };

  const getEmployeeStats = () => {
    const filtered = applyFilters(filteredUsers);
    return {
      total: filtered.length,
      admins: filtered.filter(u => u.role === 'admin').length,
      staff: filtered.filter(u => u.role === 'staff').length,
      active: filtered.filter(u => u.status === 'active').length,
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
        {(filterRole !== 'all' || filterStatus !== 'all') && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Đang lọc dữ liệu
          </span>
        )}
      </div>

      {/* Advanced Filter Panel */}
      {showAdvancedFilter && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Vai trò */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-user-tie mr-2"></i>Vai trò
            </label>
            <select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">👨‍💼 Quản lý</option>
              <option value="staff">👤 Nhân viên</option>
            </select>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-circle mr-2"></i>Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">✅ Hoạt động</option>
              <option value="inactive">⊘ Không hoạt động</option>
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
              <option value="email">Theo email</option>
              <option value="role">Theo vai trò</option>
            </select>
          </div>
        </div>
      )}

      {/* Filter Stats */}
      {(filterRole !== 'all' || filterStatus !== 'all') && (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {(() => {
            const stats = getEmployeeStats();
            return (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-600 font-semibold">Tổng cộng</div>
                  <div className="text-xl font-bold text-blue-700">{stats.total}</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-xs text-red-600 font-semibold">Quản lý</div>
                  <div className="text-xl font-bold text-red-700">{stats.admins}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-xs text-green-600 font-semibold">Nhân viên</div>
                  <div className="text-xl font-bold text-green-700">{stats.staff}</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-xs text-yellow-600 font-semibold">Đang hoạt động</div>
                  <div className="text-xl font-bold text-yellow-700">{stats.active}</div>
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
            placeholder="🔍 Tìm kiếm theo tên, email..."
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
          <span>Thêm nhân viên</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Avatar</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Tên</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Vai trò</th>
              <th className="px-4 py-3 text-left font-semibold text-sm text-gray-600">Trạng thái</th>
              <th className="px-4 py-3 text-center font-semibold text-sm text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  <i className="fas fa-spinner fa-spin mr-2"></i>Đang tải...
                </td>
              </tr>
            ) : applyFilters(filteredUsers).length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  <i className="fas fa-inbox mr-2"></i>Không có nhân viên phù hợp
                </td>
              </tr>
            ) : (
              applyFilters(filteredUsers).map((u) => (
              <tr key={u._id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="group relative inline-block">
                    <img 
                      src={getAvatarUrl(u.avatar)} 
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 hover:border-blue-400 transition cursor-pointer"
                    />
                    {/* Hover preview */}
                    <div className="absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition z-10 pointer-events-none group-hover:pointer-events-auto">
                      <img 
                        src={getAvatarUrl(u.avatar)} 
                        alt={u.name}
                        className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300 shadow-lg bg-white"
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {u.role === 'admin' ? '👨‍💼 Quản lý' : '👤 Nhân viên'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {u.status === 'active' ? '✅ Hoạt động' : '⊘ Không hoạt động'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => openEdit(u)} className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded mr-2 transition" title="Sửa">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => handleDelete(u._id)} className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded transition" title="Xóa">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSave} />
      <EditEmployeeModal isOpen={isEditModalOpen} employee={editing} onClose={() => { setIsEditModalOpen(false); setEditing(null) }} onSave={handleSave} />
    </div>
  )
}

export default Employees
