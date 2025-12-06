import React, { useState, useEffect } from 'react'
import { orderService } from '../services/orderService'
import { productService } from '../services/productService'
import { userService } from '../services/userService'
import { customerService } from '../services/customerService'
import CategoryRevenueChart from './charts/CategoryRevenueChart'
import TopCustomersChart from './charts/TopCustomersChart'

const Reports = () => {
  const [revenueStats, setRevenueStats] = useState([])
  const [inventoryStats, setInventoryStats] = useState([])
  const [employeeStats, setEmployeeStats] = useState([])
  const [customerStats, setCustomerStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const ordersRes = await orderService.getAllOrders(undefined, undefined, 1, 1000)
      const productsRes = await productService.getAllProducts(undefined, undefined, 1, 1000)
      const usersRes = await userService.getAllUsers()
      const customersRes = await customerService.getAllCustomers()

      // Ensure arrays are properly formatted
      const users = Array.isArray(usersRes) ? usersRes : usersRes?.data || []
      const customers = Array.isArray(customersRes) ? customersRes : customersRes?.data || customersRes?.customers || []

      if (ordersRes && ordersRes.orders && productsRes && productsRes.products) {
        // Calculate revenue stats
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const thisWeekStart = new Date(today)
        thisWeekStart.setDate(today.getDate() - today.getDay())
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        const thisYearStart = new Date(today.getFullYear(), 0, 1)

        const revenueToday = ordersRes.orders
          .filter(o => new Date(o.createdAt) >= today)
          .reduce((sum, o) => sum + (o.finalTotal || 0), 0)

        const revenueWeek = ordersRes.orders
          .filter(o => new Date(o.createdAt) >= thisWeekStart)
          .reduce((sum, o) => sum + (o.finalTotal || 0), 0)

        const revenueMonth = ordersRes.orders
          .filter(o => new Date(o.createdAt) >= thisMonthStart)
          .reduce((sum, o) => sum + (o.finalTotal || 0), 0)

        const revenueYear = ordersRes.orders
          .filter(o => new Date(o.createdAt) >= thisYearStart)
          .reduce((sum, o) => sum + (o.finalTotal || 0), 0)

        setRevenueStats([
          { period: 'Hôm nay', value: revenueToday.toLocaleString('vi-VN') + ' VND' },
          { period: 'Tuần này', value: revenueWeek.toLocaleString('vi-VN') + ' VND' },
          { period: 'Tháng này', value: revenueMonth.toLocaleString('vi-VN') + ' VND' },
          { period: 'Năm nay', value: revenueYear.toLocaleString('vi-VN') + ' VND' }
        ])

        // Calculate inventory stats
        const totalInventoryValue = productsRes.products.reduce((sum, p) => sum + (p.price * p.quantity || 0), 0)
        const outOfStock = productsRes.products.filter(p => p.quantity === 0).length
        const lowStock = productsRes.products.filter(p => p.quantity > 0 && p.quantity < 10).length
        const highStock = productsRes.products.filter(p => p.quantity >= 50).length

        setInventoryStats([
          { name: 'Tổng giá trị tồn kho', value: totalInventoryValue.toLocaleString('vi-VN'), type: 'normal' },
          { name: 'Sản phẩm hết hàng', value: outOfStock.toString(), type: 'danger' },
          { name: 'Sản phẩm sắp hết', value: lowStock.toString(), type: 'warning' },
          { name: 'Sản phẩm tồn nhiều', value: highStock.toString(), type: 'success' }
        ])

        // Calculate employee stats
        const totalUsers = users.length || 0
        const activeUsers = users.filter(u => u.status === 'active').length || 0
        const inactiveUsers = totalUsers - activeUsers
        const avgRevenuePerEmployee = totalUsers > 0 ? Math.round(revenueYear / totalUsers) : 0

        setEmployeeStats([
          { name: 'Tổng nhân viên', value: totalUsers.toString(), type: 'normal' },
          { name: 'Đang làm việc', value: activeUsers.toString(), type: 'success' },
          { name: 'Không hoạt động', value: inactiveUsers.toString(), type: 'warning' },
          { name: 'Doanh thu/NV', value: avgRevenuePerEmployee.toLocaleString('vi-VN'), type: 'normal' }
        ])

        // Calculate customer stats
        const totalCustomers = customers.length || 0
        const suppliers = customers.filter(c => c.type === 'supplier').length || 0
        const both = customers.filter(c => c.type === 'both').length || 0
        const pureCustomers = customers.filter(c => c.type === 'customer').length || 0

        setCustomerStats([
          { name: 'Tổng khách hàng', value: totalCustomers.toString(), type: 'normal' },
          { name: 'Khách hàng', value: pureCustomers.toString(), type: 'success' },
          { name: 'Nhà cung cấp', value: suppliers.toString(), type: 'warning' },
          { name: 'Cả hai', value: both.toString(), type: 'normal' }
        ])
      }
    } catch (err) {
      console.error('Error fetching report data:', err)
    }
    setLoading(false)
  }

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>

  const getTypeBadge = (typeColor) => {
    return `bg-${typeColor}-100 text-${typeColor}-800`;
  };

  const getValueColor = (type) => {
    switch (type) {
      case 'danger': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'success': return 'text-green-500';
      default: return 'text-gray-700';
    }
  };

  const handleExportReport = () => {
    try {
      const reportData = {
        exportDate: new Date().toLocaleString('vi-VN'),
        revenueStats,
        inventoryStats,
        employeeStats,
        customerStats
      };
      
      const csvContent = [
        ['Báo Cáo Xuất Kho - ' + new Date().toLocaleDateString('vi-VN')],
        [],
        ['DOANH THU'],
        revenueStats.map(s => [s.period, s.value]).flat(),
        [],
        ['TỒN KHO'],
        inventoryStats.map(s => [s.name, s.value]).flat(),
        [],
        ['NHÂN VIÊN'],
        employeeStats.map(s => [s.name, s.value]).flat(),
        [],
        ['KHÁCH HÀNG'],
        customerStats.map(s => [s.name, s.value]).flat()
      ].map(row => row.join(',')).join('\n');
      
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
      element.setAttribute('download', `report_${new Date().getTime()}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      alert('Báo cáo đã được xuất thành công!');
    } catch (err) {
      console.error('Export error:', err);
      alert('Lỗi khi xuất báo cáo: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Báo cáo</h2>
          <p className="text-sm text-gray-500">Xem và xuất báo cáo thống kê</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={handleExportReport} className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <i className="fas fa-file-export mr-2"></i> Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Doanh thu theo danh mục</h3>
          <div className="chart-container">
            <CategoryRevenueChart />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top 10 khách hàng</h3>
          <div className="chart-container">
            <TopCustomersChart />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Báo cáo doanh thu</h3>
          <div className="space-y-4">
            {revenueStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{stat.period}</span>
                <span className="font-medium">{stat.value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => alert('Chi tiết doanh thu:\n' + revenueStats.map(s => `${s.period}: ${s.value}`).join('\n'))} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
            Xem chi tiết
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Báo cáo tồn kho</h3>
          <div className="space-y-4">
            {inventoryStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{stat.name}</span>
                <span className={`font-medium ${getValueColor(stat.type)}`}>{stat.value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => alert('Chi tiết tồn kho:\n' + inventoryStats.map(s => `${s.name}: ${s.value}`).join('\n'))} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
            Xem chi tiết
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Báo cáo nhân viên</h3>
          <div className="space-y-4">
            {employeeStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{stat.name}</span>
                <span className={`font-medium ${getValueColor(stat.type)}`}>{stat.value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => alert('Chi tiết nhân viên:\n' + employeeStats.map(s => `${s.name}: ${s.value}`).join('\n'))} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
            Xem chi tiết
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Báo cáo khách hàng</h3>
          <div className="space-y-4">
            {customerStats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{stat.name}</span>
                <span className={`font-medium ${getValueColor(stat.type)}`}>{stat.value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => alert('Chi tiết khách hàng:\n' + customerStats.map(s => `${s.name}: ${s.value}`).join('\n'))} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
            Xem chi tiết
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Thống kê tổng hợp</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chỉ tiêu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">Tổng đơn hàng</td>
                <td className="px-4 py-3 font-medium">0</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">Tổng sản phẩm</td>
                <td className="px-4 py-3 font-medium">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;