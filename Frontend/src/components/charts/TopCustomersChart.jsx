import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { customerService } from '../../services/customerService';
import { orderService } from '../../services/orderService';

const TopCustomersChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data
        const [customersRes, ordersRes] = await Promise.all([
          customerService.getAllCustomers(),
          orderService.getAllOrders(undefined, undefined, 1, 1000)
        ]);

        // Normalize data
        let customers = [];
        let orders = [];

        // Handle customers
        if (Array.isArray(customersRes)) {
          customers = customersRes;
        } else if (customersRes?.customers) {
          customers = customersRes.customers;
        }

        // Handle orders
        if (Array.isArray(ordersRes)) {
          orders = ordersRes;
        } else if (ordersRes?.orders) {
          orders = ordersRes.orders;
        }

        // Calculate revenue by customer
        const customerRevenue = {};
        
        if (Array.isArray(customers)) {
          customers.forEach(c => {
            if (c && c._id) {
              customerRevenue[c._id] = { 
                name: c.name || 'Khách lẻ', 
                revenue: 0,
                orderCount: 0
              };
            }
          });
        }

        // Calculate revenue from orders
        if (Array.isArray(orders)) {
          orders.forEach(order => {
            // Use customerId field (not customer) - matches Order schema
            const customerId = order.customerId;
            
            if (customerId) {
              if (!customerRevenue[customerId]) {
                customerRevenue[customerId] = { 
                  name: order.customerName || 'Khách lẻ', 
                  revenue: 0,
                  orderCount: 0
                };
              }
              customerRevenue[customerId].revenue += order.finalTotal || 0;
              customerRevenue[customerId].orderCount += 1;
            } else {
              // Khách lẻ (không có customer ID)
              if (!customerRevenue['anonymous']) {
                customerRevenue['anonymous'] = { 
                  name: 'Khách lẻ', 
                  revenue: 0,
                  orderCount: 0
                };
              }
              customerRevenue['anonymous'].revenue += order.finalTotal || 0;
              customerRevenue['anonymous'].orderCount += 1;
            }
          });
        }

        // Get top 10 customers
        const topCusts = Object.values(customerRevenue)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);

        setTopCustomers(topCusts);

        const labels = topCusts.map(c => c.name);
        const data = topCusts.map(c => c.revenue);

        if (chartRef.current) {
          const ctx = chartRef.current.getContext('2d');
          
          if (chartInstance.current) {
            chartInstance.current.destroy();
          }

          chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: labels && labels.length > 0 ? labels : ['Chưa có dữ liệu'],
              datasets: [{
                label: 'Doanh thu (VND)',
                data: data && data.length > 0 ? data : [0],
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
                borderWidth: 1.5,
                borderRadius: 6
              }]
            },
            options: {
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
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
        console.error('Error fetching top customers data:', err);
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

  return (
    <div style={{ minHeight: '320px' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default TopCustomersChart;