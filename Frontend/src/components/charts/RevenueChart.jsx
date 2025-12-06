import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { orderService } from '../../services/orderService';

const RevenueChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await orderService.getAllOrders(undefined, undefined, 1, 1000);
        const orders = res?.orders || [];
        
        // Group revenue by month
        const monthlyRevenue = Array(12).fill(0);
        orders.forEach(order => {
          const date = new Date(order.createdAt);
          const month = date.getMonth();
          monthlyRevenue[month] += order.finalTotal || 0;
        });

        if (chartRef.current) {
          const ctx = chartRef.current.getContext('2d');
          
          if (chartInstance.current) {
            chartInstance.current.destroy();
          }

          chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
              datasets: [{
                label: 'Doanh thu',
                data: monthlyRevenue,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
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
        console.error('Error fetching revenue data:', err);
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

  return <canvas ref={chartRef}></canvas>;
};

export default RevenueChart;