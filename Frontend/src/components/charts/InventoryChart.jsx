import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { stockService } from '../../services/stockService';

const InventoryChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy dữ liệu theo tháng (interval=month)
        const data = await stockService.reportInventoryOverTime({ interval: 'month' });

        // API returns [{ label, inQty, outQty }]
        const labels = data.map(d => d.label);
        const inData = data.map(d => d.inQty || 0);
        const outData = data.map(d => d.outQty || 0);

        if (chartRef.current) {
          const ctx = chartRef.current.getContext('2d');
          if (chartInstance.current) chartInstance.current.destroy();

          chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels,
              datasets: [
                {
                  label: 'Nhập kho',
                  data: inData,
                  backgroundColor: 'rgba(16, 185, 129, 0.8)'
                },
                {
                  label: 'Xuất kho',
                  data: outData,
                  backgroundColor: 'rgba(239, 68, 68, 0.8)'
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
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
        console.error('Lỗi lấy dữ liệu inventory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, []);

  return <canvas ref={chartRef}></canvas>;
};

export default InventoryChart;