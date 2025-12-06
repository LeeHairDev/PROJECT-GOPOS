import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { productService } from '../../services/productService';

const ProductChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Amoxicol', 'Panadol Extra', 'Vitamin C', 'Tện sản phẩm mới', 'Gòng kinh'],
          datasets: [{
            label: 'Số lượng bán',
            data: [45, 38, 32, 28, 25],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  if (loading) return <div className="text-center py-4">Đang tải...</div>;

  return <canvas ref={chartRef}></canvas>;
};

export default ProductChart;