import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/shifts';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const Shifts = () => {
  const [shifts, setShifts] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const getLocalDateString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    description: '',
  });
  

  useEffect(() => {
    fetchShifts();
  }, [selectedDate]);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
      }
    } catch (err) {
      console.error('Error fetching shifts:', err);
    }
    setLoading(false);
  };

  const fetchEmployees = async () => {
    // employees are managed in Attendance page; removed from this view
  };

  const fetchEmployeeShifts = async () => {
    // employee-shifts listing removed from this page
  };

  const handleAddShift = () => {
    setEditingId(null);
    setFormData({ name: '', startTime: '', endTime: '', description: '' });
    setShowForm(true);
  };

  const handleEditShift = (shift) => {
    setEditingId(shift._id);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      description: shift.description,
    });
    setShowForm(true);
  };

  const handleSaveShift = async () => {
    if (!formData.name || !formData.startTime || !formData.endTime) {
      alert('Vui lòng điền đủ thông tin');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(editingId ? 'Cập nhật thành công' : 'Thêm ca làm thành công');
        fetchShifts();
        setShowForm(false);
      } else {
        alert('Lỗi khi lưu');
      }
    } catch (err) {
      console.error('Error saving shift:', err);
      alert('Lỗi khi lưu');
    }
  };

  const handleDeleteShift = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa ca làm này?')) {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (res.ok) {
          alert('Xóa thành công');
          fetchShifts();
        }
      } catch (err) {
        console.error('Error deleting shift:', err);
      }
    }
  };

  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý ca làm</h2>
          <p className="text-sm text-gray-500 mt-1">Tạo ca làm và gán cho nhân viên</p>
        </div>
        <button
          onClick={handleAddShift}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Thêm ca làm
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button className="px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-semibold">
          Danh sách ca làm
        </button>
        {/* Assign UI removed: use Attendance page to assign shifts to employees */}
      </div>

      {/* Shift List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-spinner fa-spin text-2xl mb-2"></i>
            <p>Đang tải...</p>
          </div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-inbox text-2xl mb-2"></i>
            <p>Chưa có ca làm nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Tên ca làm
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Giờ bắt đầu
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Giờ kết thúc
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shifts.map((shift) => (
                <tr key={shift._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                    {shift.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {shift.startTime}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {shift.endTime}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {shift.description}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button
                      onClick={() => handleEditShift(shift)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteShift(shift._id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Shift Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {editingId ? 'Cập nhật ca làm' : 'Thêm ca làm mới'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên ca làm
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Ca sáng"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ kết thúc
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ca làm"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveShift}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default Shifts;
