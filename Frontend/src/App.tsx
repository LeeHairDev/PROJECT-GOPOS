import React, { useState, useEffect } from 'react'
import './index.css'
import '@fortawesome/fontawesome-free/css/all.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Products from './components/Products'
import Orders from './components/Orders'
import Inventory from './components/Inventory'
import Warehouses from './components/Warehouses'
import Customers from './components/Customers'
import Categories from './components/Categories'
import Employees from './components/Employees'
import Attendance from './components/Attendance'
import Shifts from './components/Shifts'
import NewOrder from './components/NewOrder'
import Reports from './components/Reports'
import AccountInfo from './components/AccountInfo'
import AddProductModal from './components/modals/AddProductModal'
import ImportModal from './components/modals/ImportModal'
import ExportModal from './components/modals/ExportModal'
import LoginPage from './components/LoginPage'
import Toast, { useToast } from './components/Toast'
import useNotifications from './hooks/useNotifications'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importInitialProduct, setImportInitialProduct] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [refreshInventory, setRefreshInventory] = useState(0)
  const { toast, showToast, setToast } = useToast()
  const { notifications, unreadCount, removeNotification, markAsRead, clearAll } = useNotifications()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />
  }

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setIsAuthenticated(false)
      showToast('Đã đăng xuất', 'success')
    }
  }

  const tabTitles = {
    'dashboard': { title: 'Trang chủ', subtitle: 'Tổng quan hệ thống' },
    'products': { title: 'Quản lý sản phẩm', subtitle: 'Quản lý danh sách sản phẩm trong kho' },
    'categories': { title: 'Danh mục', subtitle: 'Quản lý các loại sản phẩm' },
    'employees': { title: 'Nhân viên', subtitle: 'Quản lý nhân viên và quyền' },
    'attendance': { title: 'Check-in/Check-out', subtitle: 'Quản lý thời gian làm việc nhân viên' },
    'shifts': { title: 'Quản lý ca làm', subtitle: 'Quản lý ca làm của nhân viên' },
    'orders': { title: 'Danh sách hóa đơn', subtitle: 'Quản lý các hóa đơn bán hàng' },
    'inventory': { title: 'Quản lý xuất nhập kho', subtitle: 'Theo dõi các giao dịch nhập xuất kho' },
    'warehouses': { title: 'Quản lý kho hàng', subtitle: 'Quản lý danh sách các kho hàng' },
    'customers': { title: 'Khách hàng', subtitle: 'Quản lý danh sách khách hàng' },
    'new-order': { title: 'Tạo đơn hàng mới', subtitle: 'Thêm sản phẩm và thông tin khách hàng' },
    'reports': { title: 'Báo cáo', subtitle: 'Xem và xuất báo cáo thống kê' },
    'account-info': { title: 'Thông tin tài khoản', subtitle: 'Quản lý thông tin cá nhân' }
  }

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName)
  }

  const handleSaveProduct = () => {
    showToast('Thêm sản phẩm thành công!', 'success')
    setShowAddProductModal(false)
  }

  const handleSaveImport = () => {
    showToast('Nhập kho thành công!', 'success')
    setShowImportModal(false)
    setRefreshInventory(t => t + 1)
  }

  const handleSaveExport = () => {
    showToast('Xuất kho thành công!', 'success')
    setShowExportModal(false)
    setRefreshInventory(t => t + 1)
  }

  const handleProcessOrder = () => {
    showToast('Thanh toán thành công!', 'success')
    setActiveTab('orders')
  }

  const openImportForProduct = (productId: string | null) => {
    setActiveTab('inventory')
    setImportInitialProduct(productId)
    setShowImportModal(true)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex-1 overflow-auto">
        <Header 
          title={tabTitles[activeTab as keyof typeof tabTitles]?.title || ''} 
          subtitle={tabTitles[activeTab as keyof typeof tabTitles]?.subtitle || ''}
          onLogout={handleLogout}
          onNewOrder={() => setActiveTab('new-order')}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onClearAll={clearAll}
          onRemoveNotification={removeNotification}
        />
        
        <div className="p-6">
          {activeTab === 'dashboard' && <Dashboard onOpenImport={openImportForProduct} />}
          {activeTab === 'products' && (
            <Products 
              onAddProduct={() => setShowAddProductModal(true)} 
            />
          )}
          {activeTab === 'categories' && <Categories />}
          {activeTab === 'employees' && <Employees />}
          {activeTab === 'attendance' && <Attendance />}
          {activeTab === 'shifts' && <Shifts />}
          {activeTab === 'customers' && <Customers />}
          {activeTab === 'orders' && <Orders />}
          {activeTab === 'inventory' && (
            <Inventory 
              key={refreshInventory}
            />
          )}
          {activeTab === 'warehouses' && <Warehouses />}
          {activeTab === 'new-order' && <NewOrder onProcessOrder={handleProcessOrder} />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'account-info' && <AccountInfo />}
        </div>
      </div>

      <AddProductModal 
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSave={handleSaveProduct}
      />

      <ImportModal 
        isOpen={showImportModal}
        onClose={() => { setShowImportModal(false); setImportInitialProduct(null) }}
        onSave={handleSaveImport}
        initialProductId={importInitialProduct}
      />

      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onSave={handleSaveExport}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default App
