import React, { useState } from 'react';
import { getAvatarUrl } from '../utils/avatarHelper';

const Sidebar = ({ activeTab, onTabChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
  });
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const dashboardItem = { id: 'dashboard', icon: 'fas fa-home', label: 'Trang chủ' };
  
  const menuGroups = [
    {
      group: 'Bán hàng',
      items: [
        { id: 'new-order', icon: 'fas fa-cash-register', label: 'Bán hàng' },
        { id: 'orders', icon: 'fas fa-file-invoice', label: 'Đơn hàng' },
      ]
    },
    {
      group: 'Quản lý sản phẩm',
      items: [
        { id: 'products', icon: 'fas fa-pills', label: 'Quản lý sản phẩm' },
        { id: 'categories', icon: 'fas fa-list', label: 'Danh mục' },
      ]
    },
    {
      group: 'Nhân sự',
      items: [
        { id: 'employees', icon: 'fas fa-user-tie', label: 'Nhân viên' },
        { id: 'attendance', icon: 'fas fa-clock', label: 'Check-in/Check-out' },
        { id: 'shifts', icon: 'fas fa-calendar-alt', label: 'Quản lý ca làm' },
      ]
    },
    {
      group: 'Khách hàng',
      items: [
        { id: 'customers', icon: 'fas fa-users', label: 'Khách hàng' },
      ]
    },
    {
      group: 'Quản lý kho',
      items: [
        { id: 'warehouses', icon: 'fas fa-boxes', label: 'Quản lý kho' },
        { id: 'inventory', icon: 'fas fa-warehouse', label: 'Thống kê kho' },
      ]
    },
  ];

  const reportsItem = { id: 'reports', icon: 'fas fa-chart-bar', label: 'Báo cáo' };

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-4 border-b">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <i className="fas fa-pills text-blue-600 text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-600">GoPOS</h1>
            <p className="text-xs text-gray-500">Hệ thống quản lý</p>
          </div>
        </div>
      </div>
      <nav className="mt-4">
        {/* Dashboard - Always visible at top */}
        <a
          href="#"
          className={`sidebar-item flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 ${
            activeTab === dashboardItem.id ? 'active bg-blue-50 border-l-4 border-blue-600' : ''
          }`}
          onClick={(e) => {
            e.preventDefault();
            onTabChange(dashboardItem.id);
          }}
        >
          <i className={`${dashboardItem.icon} w-4 mr-3`}></i>
          <span>{dashboardItem.label}</span>
        </a>

        <div className="my-2 border-b border-gray-200"></div>

        {/* Menu Groups */}
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <button
              onClick={() =>
                setExpandedGroups({
                  ...expandedGroups,
                  [groupIndex]: !expandedGroups[groupIndex],
                })
              }
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              <span>{group.group}</span>
              <i
                className={`fas fa-chevron-down text-xs transition ${
                  expandedGroups[groupIndex] ? 'rotate-180' : ''
                }`}
              ></i>
            </button>
            {expandedGroups[groupIndex] && (
              <div className="bg-gray-50">
                {group.items.map((item) => (
                  <a
                    key={item.id}
                    href="#"
                    className={`sidebar-item flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 ${
                      activeTab === item.id ? 'active bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      onTabChange(item.id);
                    }}
                  >
                    <i className={`${item.icon} w-4 mr-3`}></i>
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="my-2 border-b border-gray-200"></div>

        {/* Reports - Always visible at bottom */}
        <a
          href="#"
          className={`sidebar-item flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 ${
            activeTab === reportsItem.id ? 'active bg-blue-50 border-l-4 border-blue-600' : ''
          }`}
          onClick={(e) => {
            e.preventDefault();
            onTabChange(reportsItem.id);
          }}
        >
          <i className={`${reportsItem.icon} w-4 mr-3`}></i>
          <span>{reportsItem.label}</span>
        </a>
      </nav>
      <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={getAvatarUrl(user?.avatar)} 
              alt={user?.name || 'User'}
              className="w-10 h-10 rounded-full mr-3 object-cover border border-gray-200"
              onError={(e) => {
                e.target.src = getAvatarUrl(null);
              }}
            />
            <div>
              <p className="text-sm font-medium">{user?.name || 'Nguyễn Văn A'}</p>
              <p className="text-xs text-gray-500">{user?.role === 'admin' ? '👨‍💼 Quản lý' : '👤 Nhân viên'}</p>
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-500 hover:text-gray-700 transition"
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
            
            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 bottom-12 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {/* Thông tin tài khoản */}
                <button
                  onClick={() => {
                    onTabChange('account-info');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 border-b border-gray-100 flex items-center"
                >
                  <i className="fas fa-user mr-3 text-blue-600"></i>
                  Thông tin tài khoản
                </button>
                
                {/* Đăng xuất */}
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/login';
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <i className="fas fa-sign-out-alt mr-3"></i>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;