import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { uploadImage } from '../services/uploadService';
import { getAvatarUrl } from '../utils/avatarHelper';

const AccountInfo = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      // Lấy từ localStorage trước, hoặc gọi API nếu cần
      if (user.id) {
        try {
          const userInfo = await userService.getUserById(user.id);
          setForm({
            name: userInfo.name || '',
            email: userInfo.email || '',
            phone: userInfo.phone || '',
            address: userInfo.address || '',
            avatar: userInfo.avatar || '',
          });
          setImagePreview(userInfo.avatar || null);
        } catch (apiErr) {
          // Nếu API fail, dùng dữ liệu từ localStorage
          setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
            avatar: user.avatar || '',
          });
          setImagePreview(user.avatar || null);
        }
      }
    } catch (err) {
      console.error('Error fetching user info:', err);
      setMessage({ type: 'error', text: 'Lỗi khi tải thông tin' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file, 'gopos/users');
      setForm({ ...form, avatar: imageUrl });
      setMessage({ type: 'success', text: 'Ảnh đã được cập nhật' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi upload ảnh: ' + err.message });
      setImagePreview(form.avatar || null);
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userService.updateUser(user.id, form);
      
      // Update localStorage
      const updatedUser = { ...user, ...form };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi cập nhật: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

    {/* Message */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Avatar Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ảnh đại diện</h3>
        <div className="flex items-center gap-6">
          {/* Avatar Preview */}
          <div className="flex-shrink-0">
            <img 
              src={getAvatarUrl(imagePreview || form.avatar)} 
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-md"
            />
          </div>
          
          {/* Upload Section */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn ảnh mới
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50"
            />
            {uploading && <p className="text-sm text-blue-500 mt-2">Đang upload ảnh...</p>}
            <p className="text-xs text-gray-500 mt-2">Hỗ trợ: JPG, PNG (tối đa 5MB)</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên của bạn"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập email"
                required
              />
            </div>
          </div>

          {/* Phone & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điện thoại
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập địa chỉ"
              />
            </div>
          </div>

          {/* Role & Status Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Vai trò</p>
              <p className="text-lg font-semibold text-blue-600 mt-1">
                {user.role === 'admin' ? '👨‍💼 Quản lý' : '👤 Nhân viên'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Trạng thái</p>
              <p className="text-lg font-semibold text-green-600 mt-1">✅ Hoạt động</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition duration-200"
            >
              {loading ? 'Đang lưu...' : '💾 Lưu thay đổi'}
            </button>
            <button
              type="button"
              onClick={fetchUserInfo}
              disabled={loading}
              className="flex-1 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 px-6 py-2 rounded-lg font-medium transition duration-200"
            >
              🔄 Tải lại
            </button>
          </div>
        </form>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-gray-600 text-sm">Tài khoản được tạo</p>
          <p className="text-lg font-semibold text-gray-800 mt-1">
            {new Date().toLocaleDateString('vi-VN')}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-gray-600 text-sm">ID tài khoản</p>
          <p className="text-lg font-semibold text-gray-800 mt-1 truncate">{user.id}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-gray-600 text-sm">Quyền hạn</p>
          <p className="text-lg font-semibold text-gray-800 mt-1">
            {user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
