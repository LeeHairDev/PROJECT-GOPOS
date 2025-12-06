import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/attendance';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const Attendance = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';
  
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  // Use local date (browser timezone) to avoid UTC rollover at midnight
  const getLocalDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [currentDate, setCurrentDate] = useState(getLocalDateString());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedEmployeeSales, setSelectedEmployeeSales] = useState(null);
  const [loadingSales, setLoadingSales] = useState(false);
  const [filter, setFilter] = useState('all'); // all, checked-in, checked-out
  
  const [activeTab, setActiveTab] = useState('attendance'); // attendance, shifts
  const [shiftsView, setShiftsView] = useState('all'); // 'all' or 'mine'
  const [shifts, setShifts] = useState([]); // All available shifts
  const [employeeShifts, setEmployeeShifts] = useState([]); // Today's employee shifts
  const [lateEmployees, setLateEmployees] = useState([]); // Employees who checked in late

  useEffect(() => {
    fetchEmployees();
    fetchAttendance();
    fetchShifts();
    fetchEmployeeShiftsForDate();
    if (activeTab === 'reports') {
      fetchSalesReports();
    }
    // Refresh attendance every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchAttendance();
      checkLateEmployees();
    }, 30000);
    return () => clearInterval(interval);
  }, [currentDate, activeTab]);

  // Fetch employees only once on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const res = await fetch(`${API_URL}/employees`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Employees fetched:', data);
        // Ensure data is an array
        if (Array.isArray(data)) {
          setEmployees(data);
        } else {
          console.error('Expected array but got:', typeof data);
          setEmployees([]);
        }
      } else {
        console.error('Error fetching employees:', res.status);
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/by-date?date=${currentDate}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setAttendance(data.attendances || []);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
    setLoading(false);
  };

  const fetchEmployeeSales = async (employeeId) => {
    setLoadingSales(true);
    try {
      const res = await fetch(`${API_URL}/sales/by-date?employeeId=${employeeId}&date=${currentDate}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedEmployeeSales(data);
      } else {
        console.error('Error fetching sales');
        setSelectedEmployeeSales(null);
      }
    } catch (err) {
      console.error('Error fetching employee sales:', err);
      setSelectedEmployeeSales(null);
    }
    setLoadingSales(false);
  };

  const fetchSalesReports = async () => {
    try {
      const res = await fetch(`${API_URL}/by-date?date=${currentDate}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const attendances = data.attendances || [];
        
        // Fetch sales for each checked-out employee
        const reports = [];
        for (const att of attendances) {
          if (att.status === 'checked-out' && att.employee._id) {
            try {
              const salesRes = await fetch(
                `${API_URL}/sales/by-date?employeeId=${att.employee._id}&date=${currentDate}`,
                { headers: getAuthHeaders() }
              );
              if (salesRes.ok) {
                const salesData = await salesRes.json();
                reports.push({
                  employee: att.employee,
                  attendance: att,
                  sales: salesData.sales,
                });
              }
            } catch (err) {
              console.error('Error fetching sales for employee:', err);
            }
          }
        }
        setSalesReports(reports);
      }
    } catch (err) {
      console.error('Error fetching sales reports:', err);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/shifts', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
      }
    } catch (err) {
      console.error('Error fetching shifts:', err);
    }
  };

  const fetchEmployeeShiftsForDate = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/shifts/by-date?date=${currentDate}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setEmployeeShifts(data);
        checkLateEmployees(data);
      }
    } catch (err) {
      console.error('Error fetching employee shifts:', err);
    }
  };

  const checkLateEmployees = async (shiftsData = null) => {
    try {
      const shifts = shiftsData || employeeShifts;
      const currentAttendance = attendance;

      const late = [];
      for (const empShift of shifts) {
        const att = currentAttendance.find(a => a.employee._id === empShift.employee._id);
        if (att && att.checkInTime) {
          // Parse times
          const [shiftHour, shiftMin] = empShift.shift.startTime.split(':').map(Number);
          const [checkInHour, checkInMin] = att.checkInTime.split(':').map(Number);
          
          const shiftStartMinutes = shiftHour * 60 + shiftMin;
          const checkInMinutes = checkInHour * 60 + checkInMin;
          
          const lateMinutes = checkInMinutes - shiftStartMinutes;
          
          if (lateMinutes > 0) {
            late.push({
              employee: empShift.employee,
              shift: empShift.shift,
              shiftStartTime: empShift.shift.startTime,
              checkInTime: att.checkInTime,
              lateMinutes: lateMinutes,
            });
          }
        }
      }
      setLateEmployees(late);
    } catch (err) {
      console.error('Error checking late employees:', err);
    }
  };

  // Can employee check in? Only allow check-in at most 1 hour before shift start if assigned
  const canCheckIn = (employeeId) => {
    try {
      const es = employeeShifts.find((s) => s.employee._id === employeeId || s.employee === employeeId);
      if (!es || !es.shift || !es.shift.startTime) return true; // no assigned shift -> allow

      const [hour, min] = es.shift.startTime.split(":").map(Number);
      const parts = currentDate.split("-");
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      const shiftStart = new Date(year, month, day, hour, min, 0);
      const earliest = new Date(shiftStart.getTime() - 60 * 60 * 1000);
      const now = new Date();
      return now >= earliest;
    } catch (err) {
      console.error('canCheckIn error', err);
      return true;
    }
  };

  const isMyShift = (es) => {
    if (!currentUser) return false;
    const myId = currentUser._id || currentUser.id || null;
    const myEmail = currentUser.email || null;
    if (myId && es.employee && (es.employee._id === myId || es.employee.id === myId)) return true;
    if (myEmail && es.employee && es.employee.email === myEmail) return true;
    return false;
  };

  const handleAssignShift = async (employeeId, shiftId) => {
    try {
      // Gán ca cho 30 ngày tới (không chỉ hôm nay)
      const assignPromises = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = getLocalDateString(date);

        assignPromises.push(
          fetch('http://localhost:5000/api/shifts/assign', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              employeeId,
              shiftId,
              date: dateStr,
            }),
          })
        );
      }

      const results = await Promise.all(assignPromises);
      const allOk = results.every(r => r.ok);

      if (allOk) {
        alert('✓ Gán ca thành công cho 30 ngày tới');
        fetchEmployeeShiftsForDate();
      } else {
        alert('⚠️ Gán ca có lỗi, kiểm tra console');
      }
    } catch (err) {
      console.error('Error assigning shift:', err);
      alert('Lỗi gán ca');
    }
  };


  const handleCheckIn = async (employeeId) => {
    try {
      const res = await fetch(`${API_URL}/check-in`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          employeeId,
          date: currentDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert('✓ Check-in thành công - ' + data.attendance.checkInTime);
        fetchAttendance();
      } else {
        const error = await res.json();
        alert('Lỗi: ' + error.message);
      }
    } catch (err) {
      console.error('Error checking in:', err);
      alert('Lỗi check-in');
    }
  };

  const handleCheckOut = async (employeeId) => {
    try {
      const res = await fetch(`${API_URL}/check-out`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          employeeId,
          date: currentDate,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert('✓ Check-out thành công - ' + data.attendance.checkOutTime);
        fetchAttendance();
        fetchEmployeeSales(employeeId);
      } else {
        const error = await res.json();
        alert('Lỗi: ' + error.message);
      }
    } catch (err) {
      console.error('Error checking out:', err);
      alert('Lỗi check-out');
    }
  };

  const getFilteredAttendance = () => {
    let filtered = attendance;
    
    if (filter !== 'all') {
      filtered = filtered.filter(a => a.status === filter);
    }

    return filtered;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'checked-in': { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Đã vào' },
      'checked-out': { bg: 'bg-blue-100', text: 'text-blue-800', label: '✓ Đã ra' },
      'absent': { bg: 'bg-red-100', text: 'text-red-800', label: '✗ Vắng' },
    };
    const badge = badges[status] || badges['absent'];
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Employee list button removed; managed in Quản lý ca làm page */}
        </div>
        {isAdmin && (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
            👨‍💼 Quản lý
          </span>
        )}
      </div>

      {/* Employee list removed (use Quản lý ca làm page) */}

      {/* Quick Check-out removed: check-out actions are available in the attendance table */}

      {/* Main Tabs: Attendance vs Reports vs Shifts */}
      <div className="flex gap-4 border-b border-gray-300 flex-wrap">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-3 font-semibold transition border-b-2 ${
            activeTab === 'attendance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fas fa-clock mr-2"></i>
          Chấm công
        </button>
        <button
          onClick={() => setActiveTab('shifts')}
          className={`px-4 py-3 font-semibold transition border-b-2 ${
            activeTab === 'shifts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fas fa-tasks mr-2"></i>
          Ca làm
        </button>
      </div>

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <>
      {/* Filter Tabs */}
      <div className="flex gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'all'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Tất cả ({attendance.length})
        </button>
        <button
          onClick={() => setFilter('checked-in')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'checked-in'
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          Đã vào ({attendance.filter(a => a.status === 'checked-in' || a.status === 'checked-out').length})
        </button>
        <button
          onClick={() => setFilter('checked-out')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'checked-out'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          }`}
        >
          Đã ra ({attendance.filter(a => a.status === 'checked-out').length})
        </button>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
            <p>Đang tải...</p>
          </div>
        ) : getFilteredAttendance().length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-inbox text-2xl mb-2"></i>
            <p>Không có dữ liệu</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Tên nhân viên
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Thời gian vào
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Thời gian ra
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Thời gian làm
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getFilteredAttendance().map((record) => (
                <tr key={record._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {record.employee?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.checkInTime ? (
                      <span className="text-green-600 font-semibold">{record.checkInTime}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {record.checkOutTime ? (
                      <span className="text-blue-600 font-semibold">{record.checkOutTime}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {record.workDuration || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    {record.status === 'checked-in' && (
                      <button
                        onClick={() => handleCheckOut(record.employee._id)}
                        className="text-blue-600 hover:text-blue-800 transition font-semibold"
                        title="Check-out"
                      >
                        <i className="fas fa-sign-out-alt"></i> Ra
                      </button>
                    )}
                    {record.status === 'absent' && (
                      <button
                        onClick={() => {
                          if (!canCheckIn(record.employee._id)) {
                            alert('Chưa đến thời gian cho phép check-in (chỉ được check-in trong vòng 1 giờ trước giờ vào ca)');
                            return;
                          }
                          handleCheckIn(record.employee._id);
                        }}
                        disabled={!canCheckIn(record.employee._id)}
                        className={`text-green-600 hover:text-green-800 transition font-semibold ${!canCheckIn(record.employee._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={canCheckIn(record.employee._id) ? 'Check-in' : 'Chưa đến thời gian cho phép'}
                      >
                        <i className="fas fa-sign-in-alt"></i> Vào
                      </button>
                    )}
                    {record.status === 'checked-out' && (
                      <button
                        onClick={() => fetchEmployeeSales(record.employee._id)}
                        className="text-purple-600 hover:text-purple-800 transition font-semibold"
                        title="Xem doanh thu"
                      >
                        <i className="fas fa-chart-line"></i> Doanh thu
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-semibold">Đã vào</p>
              <p className="text-2xl font-bold text-green-600">
                {attendance.filter(a => a.status === 'checked-in' || a.status === 'checked-out').length}
              </p>
            </div>
            <i className="fas fa-sign-in-alt text-3xl text-green-600 opacity-20"></i>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-semibold">Đã ra</p>
              <p className="text-2xl font-bold text-blue-600">
                {attendance.filter(a => a.status === 'checked-out').length}
              </p>
            </div>
            <i className="fas fa-sign-out-alt text-3xl text-blue-600 opacity-20"></i>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-semibold">Vắng</p>
              <p className="text-2xl font-bold text-red-600">
                {attendance.filter(a => a.status === 'absent').length}
              </p>
            </div>
            <i className="fas fa-user-slash text-3xl text-red-600 opacity-20"></i>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Sales Performance Modal */}
      {selectedEmployeeSales && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-96 overflow-auto">
            <div className="sticky top-0 p-6 border-b border-gray-200 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  <i className="fas fa-chart-line mr-2 text-blue-600"></i>
                  Báo cáo bán hàng - {selectedEmployeeSales.attendance.employee.name}
                </h3>
                <button
                  onClick={() => setSelectedEmployeeSales(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Attendance Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Thời gian làm việc</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Vào lúc</p>
                    <p className="text-lg font-bold text-green-600">
                      {selectedEmployeeSales.attendance.checkInTime || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ra lúc</p>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedEmployeeSales.attendance.checkOutTime || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tổng thời gian</p>
                    <p className="text-lg font-bold text-purple-600">
                      {selectedEmployeeSales.attendance.workDuration || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sales Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-700 font-semibold">Số đơn bán</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedEmployeeSales.sales.totalOrders}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-700 font-semibold">Tổng doanh thu</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedEmployeeSales.sales.totalRevenue.toLocaleString('vi-VN')} đ
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-purple-700 font-semibold">Số sản phẩm bán</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedEmployeeSales.sales.totalItems}
                  </p>
                </div>
              </div>

              {/* Orders List */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Chi tiết đơn hàng</p>
                {selectedEmployeeSales.sales.orders.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">Không có đơn bán</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedEmployeeSales.sales.orders.map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {order.total.toLocaleString('vi-VN')} đ
                          </p>
                          <p className="text-xs text-gray-500">{order.itemCount} sản phẩm</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedEmployeeSales(null)}
                className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHIFTS TAB */}
      {activeTab === 'shifts' && (
        <div className="space-y-6">
          {/* Late Employees Alert */}
          {lateEmployees.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
              <div className="flex items-start">
                <i className="fas fa-exclamation-triangle text-red-600 mr-3 mt-1"></i>
                <div>
                  <p className="text-red-800 font-semibold mb-2">⚠️ Nhân viên đi muộn ({lateEmployees.length})</p>
                  <div className="space-y-1">
                    {lateEmployees.map((emp, idx) => (
                      <p key={idx} className="text-sm text-red-700">
                        • <strong>{emp.employee.name}</strong> - Lên ca lúc <strong>{emp.shiftStartTime}</strong>, check-in lúc <strong>{emp.checkInTime}</strong> (muộn {emp.lateMinutes} phút)
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shifts for Today */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    <i className="fas fa-tasks mr-2"></i>
                    Danh sách ca làm hôm nay ({
                      (shiftsView === 'all' ? employeeShifts : employeeShifts.filter(es => isMyShift(es))).length
                    })
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/80 mr-2">Hiển thị:</span>
                    <button
                      onClick={() => setShiftsView('all')}
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${shiftsView === 'all' ? 'bg-white text-blue-700' : 'bg-white/20 text-white'}`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setShiftsView('mine')}
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${shiftsView === 'mine' ? 'bg-white text-blue-700' : 'bg-white/20 text-white'}`}
                    >
                      Của tôi
                    </button>
                  </div>
                </div>
              </div>

            { (shiftsView === 'all' ? employeeShifts : employeeShifts.filter(es => isMyShift(es))).length === 0 ? (
              <div className="p-12 text-center">
                <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg">Chưa có ca làm nào được gán</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nhân viên</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ca làm</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Giờ vào - Giờ ra</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Check-in</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(shiftsView === 'all' ? employeeShifts : employeeShifts.filter(es => isMyShift(es))).map((es) => {
                      const att = attendance.find(a => a.employee._id === es.employee._id);
                      const isLate = lateEmployees.some(le => le.employee._id === es.employee._id);
                      
                      return (
                        <tr key={es._id} className={`hover:bg-gray-50 transition ${isLate ? 'bg-red-50' : ''}`}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">
                            {es.employee.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                              {es.shift.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="text-green-600 font-semibold">{es.shift.startTime}</span> - <span className="text-blue-600 font-semibold">{es.shift.endTime}</span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {att && att.checkInTime ? (
                              <span className={`font-semibold ${isLate ? 'text-red-600' : 'text-green-600'}`}>
                                {att.checkInTime} {isLate && <i className="fas fa-exclamation-triangle ml-1"></i>}
                              </span>
                            ) : (
                              <span className="text-gray-400">Chưa check-in</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {att ? (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                att.status === 'checked-out' ? 'bg-blue-100 text-blue-800' :
                                att.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {att.status === 'checked-out' ? 'Đã ra' : att.status === 'checked-in' ? 'Đã vào' : 'Vắng'}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Assign Shift: allow admin to assign a shift directly from Attendance */}
          {isAdmin && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  <i className="fas fa-plus-circle mr-2 text-green-600"></i>
                  Gán ca cho nhân viên
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  Gán ca sẽ áp dụng cho 30 ngày tới
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn nhân viên {employees.length > 0 && <span className="text-xs text-gray-500">({employees.length})</span>}
                  </label>
                  {employeesLoading ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 flex items-center">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Đang tải...
                    </div>
                  ) : employees.length === 0 ? (
                    <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-600 text-sm">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Không có nhân viên nào
                    </div>
                  ) : (
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">-- Chọn nhân viên --</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} ({emp.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn ca {shifts.length > 0 && <span className="text-xs text-gray-500">({shifts.length})</span>}
                  </label>
                  {shifts.length === 0 ? (
                    <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-600 text-sm">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Không có ca nào
                    </div>
                  ) : (
                    <select
                      id="shiftSelect"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">-- Chọn ca --</option>
                      {shifts.map(shift => (
                        <option key={shift._id} value={shift._id}>
                          {shift.name} ({shift.startTime} - {shift.endTime})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      const shiftId = document.getElementById('shiftSelect').value;
                      if (selectedEmployee && shiftId) {
                        handleAssignShift(selectedEmployee, shiftId);
                        setSelectedEmployee('');
                        document.getElementById('shiftSelect').value = '';
                      } else {
                        alert('Vui lòng chọn nhân viên và ca');
                      }
                    }}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    <i className="fas fa-check mr-2"></i>
                    Gán ca
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
