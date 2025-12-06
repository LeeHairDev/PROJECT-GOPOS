import React, { useState, useEffect } from 'react'
import { warehouseService } from '../services/warehouseService'
import { productService } from '../services/productService'
import InventoryChart from './charts/InventoryChart'
import TopImportChart from './charts/TopImportChart'

const Inventory = () => {
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState([])
  const [warehouseCounts, setWarehouseCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchInventoryData = async () => {
    try {
      // Fetch warehouses
      const warehouseRes = await warehouseService.getAllWarehouses()
      const warehouseList = warehouseRes.warehouses || []
      setWarehouses(warehouseList)

      // Fetch products
      const productRes = await productService.getAllProducts(undefined, undefined, 1, 1000)
      const productList = productRes.products || productRes || []
      setProducts(productList)

      // Count products per warehouse (if product.warehouse present)
      const counts = {}
      productList.forEach(p => {
        const wid = p?.warehouse ? (p.warehouse._id ? p.warehouse._id.toString() : p.warehouse.toString()) : null
        if (wid) counts[wid] = (counts[wid] || 0) + 1
      })
      setWarehouseCounts(counts)

      // Calculate warehouse stats
      const totalValue = productList.reduce((sum, p) => sum + ((p.price || 0) * (p.quantity || 0)), 0)
      const outOfStock = productList.filter(p => p.quantity === 0).length
      const totalProducts = productList.length

      setStats([
        {
          title: 'Tổng số kho',
          value: warehouseList.length.toString(),
          change: '+1',
          changeType: 'positive',
          icon: 'fas fa-warehouse',
          color: 'blue'
        },
        {
          title: 'Tổng giá trị hàng',
          value: totalValue.toLocaleString('vi-VN') + ' đ',
          change: '+8.5%',
          changeType: 'positive',
          icon: 'fas fa-box',
          color: 'green'
        },
        {
          title: 'Sản phẩm hết hàng',
          value: outOfStock.toString(),
          change: `-${outOfStock}`,
          changeType: outOfStock > 5 ? 'negative' : 'positive',
          icon: 'fas fa-exclamation-triangle',
          color: outOfStock > 0 ? 'red' : 'green'
        },
        {
          title: 'Tổng sản phẩm',
          value: totalProducts.toString(),
          change: '+3.2%',
          changeType: 'positive',
          icon: 'fas fa-cubes',
          color: 'yellow'
        }
      ])
    } catch (err) {
      console.error('Error fetching inventory data:', err)
    }
    setLoading(false)
  }

  const handleRefresh = () => {
    setRefreshTrigger(t => t + 1)
  }

  useEffect(() => {
    fetchInventoryData()
  }, [refreshTrigger])

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="card bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className={`text-sm mt-1 ${
                  stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                }`}>
                  <i className={`fas fa-arrow-${stat.changeType === 'positive' ? 'up' : 'down'}`}></i>
                  {' '}{stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100 text-${stat.color}-600`}>
                <i className={`${stat.icon} text-xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Xuất nhập kho theo tháng</h3>
          <div className="chart-container">
            <InventoryChart />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top 5 sản phẩm nhập nhiều nhất</h3>
          <div className="chart-container">
            <TopImportChart />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Thống kê kho hàng</h3>
          <button onClick={handleRefresh} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <i className="fas fa-sync-alt mr-2"></i>Làm mới
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên kho</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa điểm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sức chứa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số sản phẩm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quản lý</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {warehouses.map((warehouse) => (
                <tr key={warehouse._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{warehouse.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{warehouse.location || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{warehouse.address || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{warehouse.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{warehouseCounts[warehouse._id] || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{warehouse.manager || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      warehouse.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {warehouse.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Inventory