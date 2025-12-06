import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import RevenueChart from './charts/RevenueChart';
import ProductChart from './charts/ProductChart';

const Dashboard = ({ onOpenImport }) => {
  const [stats, setStats] = useState([
    { title: 'Doanh thu ước tính', value: '0', change: '+0%', changeType: 'neutral', icon: 'fas fa-dollar-sign', color: 'blue' },
    { title: 'Tổng số đơn hàng', value: '0', change: '+0%', changeType: 'neutral', icon: 'fas fa-shopping-cart', color: 'green' },
    { title: 'Tổng sản phẩm', value: '0', change: '+0%', changeType: 'neutral', icon: 'fas fa-box', color: 'yellow' },
    { title: 'Sản phẩm sắp hết hàng', value: '0', change: '(Dưới 10)', changeType: 'warning', icon: 'fas fa-exclamation-triangle', color: 'red' }
  ]);

  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const productsRes = await productService.getAllProducts(undefined, undefined, 1, 100);
      const products = productsRes?.products || [];

      // Fetch orders
      const ordersRes = await orderService.getAllOrders(undefined, undefined, 1, 100);
      const orders = ordersRes?.orders || [];

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + (order.finalTotal || 0), 0);
      const lowStockCount = products.filter(p => p.quantity < 10).length;

      setStats([
        {
          title: 'Doanh thu ước tính',
          value: totalRevenue.toLocaleString() + ' VND',
          change: '+5%',
          changeType: 'positive',
          icon: 'fas fa-dollar-sign',
          color: 'blue'
        },
        {
          title: 'Tổng số đơn hàng',
          value: orders.length,
          change: '+2%',
          changeType: 'positive',
          icon: 'fas fa-shopping-cart',
          color: 'green'
        },
        {
          title: 'Tổng sản phẩm',
          value: products.length,
          change: '+1',
          changeType: 'positive',
          icon: 'fas fa-box',
          color: 'yellow'
        },
        {
          title: 'Sản phẩm sắp hết hàng',
          value: lowStockCount,
          change: `(Dưới 10)`,
          changeType: lowStockCount > 0 ? 'negative' : 'neutral',
          icon: 'fas fa-exclamation-triangle',
          color: 'red'
        }
      ]);

      // Compute best selling products from orders (by sold quantity)
      const productInfo = {}
      products.forEach(p => {
        productInfo[p._id] = { name: p.name, sku: p.sku, price: p.price }
      })

      const sales = {}
      orders.forEach(order => {
        (order.items || []).forEach(item => {
          const pid = item.product?._id || item.product
          if (!pid) return
          sales[pid] = sales[pid] || { sold: 0, revenue: 0 }
          sales[pid].sold += Number(item.quantity || 0)
          sales[pid].revenue += Number(item.price || 0) * Number(item.quantity || 0)
        })
      })

      const topProducts = Object.keys(sales)
        .map(pid => ({
          id: pid,
          name: (productInfo[pid] && productInfo[pid].name) || sales[pid].name || 'Không rõ',
          code: (productInfo[pid] && productInfo[pid].sku) || '',
          quantity: sales[pid].sold,
          revenue: sales[pid].revenue,
          icon: 'fas fa-box',
          color: 'blue'
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 3)
        .map(p => ({
          ...p,
          quantity: p.quantity + ' ' + (p.code ? 'hộp' : 'cái'),
          revenue: p.revenue.toLocaleString() + ' VND'
        }))
      setBestSellingProducts(topProducts)

      // Low stock products (use products list)
      const lowStock = products
        .filter(p => p.quantity < 20)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 3)
        .map(p => ({
          id: p._id,
          name: p.name,
          code: p.sku,
          stock: p.quantity,
          icon: 'fas fa-exclamation-circle',
          color: p.quantity < 5 ? 'red' : 'orange'
        }))
      setLowStockProducts(lowStock)
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
    setLoading(false);
  };

  return (
    <div>
      {loading ? (
        <div className="text-center py-8">Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="card bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-sm mt-1 ${
                      stat.changeType === 'positive' ? 'text-green-500' :
                      stat.changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {stat.changeType === 'positive' && <i className="fas fa-arrow-up"></i>}
                      {stat.changeType === 'negative' && <i className="fas fa-arrow-down"></i>}
                      {stat.changeType === 'neutral' && <i className="fas fa-minus"></i>}
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Doanh thu theo tháng</h3>
              <div className="chart-container">
                <RevenueChart />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Sản phẩm bán chạy</h3>
              <div className="chart-container">
                <ProductChart />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Selling Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Sản phẩm bán chạy</h3>
              </div>
              {bestSellingProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {bestSellingProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg bg-${product.color}-100 mr-3`}>
                          <i className={`${product.icon} text-${product.color}-600`}></i>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.quantity}</p>
                        <p className="text-sm text-gray-500">{product.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Stock Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Sản phẩm sắp hết hàng</h3>
              </div>
              {lowStockProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Tất cả sản phẩm đều có hàng</p>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg bg-${product.color}-100 mr-3`}>
                          <i className={`${product.icon} text-${product.color}-600`}></i>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.code}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onOpenImport && onOpenImport(product.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Nhập hàng
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
