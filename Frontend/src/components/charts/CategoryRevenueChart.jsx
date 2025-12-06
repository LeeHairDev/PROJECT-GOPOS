import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';

const CategoryRevenueChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all data
        const [categoriesRes, productsRes, ordersRes] = await Promise.all([
          categoryService.getAllCategories(undefined, 1, 1000),
          productService.getAllProducts(undefined, undefined, 1, 1000),
          orderService.getAllOrders(undefined, undefined, 1, 1000)
        ]);

        // Normalize data
        let categories = [];
        let products = [];
        let orders = [];

        // Handle categories
        if (Array.isArray(categoriesRes)) {
          categories = categoriesRes;
        } else if (categoriesRes?.categories) {
          categories = categoriesRes.categories;
        } else if (categoriesRes?.value) {
          categories = categoriesRes.value;
        }

        // Handle products
        if (Array.isArray(productsRes)) {
          products = productsRes;
        } else if (productsRes?.products) {
          products = productsRes.products;
        }

        // Handle orders
        if (Array.isArray(ordersRes)) {
          orders = ordersRes;
        } else if (ordersRes?.orders) {
          orders = ordersRes.orders;
        }

        // Calculate revenue by category
        const categoryRevenue = {};
        
        // Initialize all categories
        if (Array.isArray(categories)) {
          categories.forEach(cat => {
            if (cat && cat._id) {
              categoryRevenue[cat._id] = { 
                name: cat.name || 'Không rõ', 
                revenue: 0,
                productCount: 0
              };
            }
          });
        }

        // Count products by category
        // Handle both populated category objects and plain IDs
        if (Array.isArray(products)) {
          products.forEach(product => {
            if (product && product.category) {
              const categoryId = product.category?._id || product.category;
              const categoryName = (typeof product.category === 'object' && product.category?.name) 
                || product.categoryName 
                || 'Không rõ';
              
              if (!categoryRevenue[categoryId]) {
                categoryRevenue[categoryId] = { 
                  name: categoryName, 
                  revenue: 0,
                  productCount: 0
                };
              }
              categoryRevenue[categoryId].productCount += 1;
            }
          });
        }

        // Calculate revenue from orders
        if (Array.isArray(orders)) {
          orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach(item => {
                if (item.product) {
                  const productId = item.product?._id || item.product;
                  const product = products.find(p => p._id === productId);
                  
                  if (product && product.category) {
                    const categoryId = product.category?._id || product.category;
                    const categoryName = (typeof product.category === 'object' && product.category?.name) 
                      || product.categoryName 
                      || 'Không rõ';
                    
                    if (!categoryRevenue[categoryId]) {
                      categoryRevenue[categoryId] = { 
                        name: categoryName, 
                        revenue: 0,
                        productCount: 0
                      };
                    }
                    categoryRevenue[categoryId].revenue += (item.quantity * item.price) || 0;
                  }
                }
              });
            }
          });
        }

        const chartData = Object.values(categoryRevenue);
        const categoryLabels = chartData.map(c => `${c.name} (${c.productCount} SP)`);
        const revenueData = chartData.map(c => c.revenue);

        if (chartRef.current) {
          const ctx = chartRef.current.getContext('2d');
          
          if (chartInstance.current) {
            chartInstance.current.destroy();
          }

          chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: categoryLabels && categoryLabels.length > 0 ? categoryLabels : ['Chưa có dữ liệu'],
              datasets: [{
                label: 'Doanh thu (VND)',
                data: revenueData && revenueData.length > 0 ? revenueData : [0],
                backgroundColor: [
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(139, 92, 246, 0.8)',
                  'rgba(236, 72, 153, 0.8)',
                  'rgba(75, 192, 192, 0.8)',
                  'rgba(255, 159, 64, 0.8)',
                  'rgba(54, 162, 235, 0.8)',
                  'rgba(255, 99, 132, 0.8)',
                  'rgba(153, 102, 255, 0.8)'
                ],
                borderColor: '#fff',
                borderWidth: 1,
                borderRadius: 4
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top'
                }
              },
              scales: {
                x: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return value.toLocaleString('vi-VN');
                    }
                  }
                }
              }
            }
          });
        }
      } catch (err) {
        console.error('Error fetching category revenue data:', err);
      }
      setLoading(false);
    };

    fetchData();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  if (loading) return <div className="text-center py-4">Đang tải...</div>;

  return <canvas ref={chartRef} style={{ minHeight: '300px' }}></canvas>;
};

export default CategoryRevenueChart;