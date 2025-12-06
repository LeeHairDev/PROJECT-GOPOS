import React, { useEffect, useState } from 'react';
import { uploadImage } from '../../services/uploadService';
import { getAvatarUrl } from '../../utils/avatarHelper';
import { customerService } from '../../services/customerService';

const EditCustomerModal = ({ isOpen, customer, onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', type: 'customer', avatar: '' });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        type: customer.type || 'customer',
        avatar: customer.avatar || '',
      });
      setImagePreview(customer.avatar || null);
    }
  }, [customer]);

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
      const imageUrl = await uploadImage(file, 'gopos/customers');
      setForm({ ...form, avatar: imageUrl });
    } catch (err) {
      alert('Lỗi upload ảnh: ' + err.message);
      setImagePreview(form.avatar || null);
    }
    setUploading(false);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }

    setLoading(true);
    try {
      const res = await customerService.updateCustomer(customer._id, form);
      if (res.message && (res.message.includes('thành công') || res.message.includes('successfully'))) {
        alert('Cập nhật khách hàng thành công');
        onSave?.();
        onClose?.();
      } else {
        alert('Lỗi: ' + (res.message || 'Không thành công'));
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      alert('Lỗi khi cập nhật khách hàng: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Chỉnh sửa khách hàng</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên khách hàng"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập email"
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
              <input 
                type="tel" 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập điện thoại"
              />
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <textarea 
                value={form.address} 
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập địa chỉ"
                rows="2"
              />
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh đại diện</label>
              <input 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
                className="w-full px-3 py-2 border rounded-lg disabled:opacity-50"
              />
              {uploading && <p className="text-sm text-blue-500 mt-1">Đang upload ảnh...</p>}
              {imagePreview && (
                <div className="mt-2">
                  <img src={getAvatarUrl(imagePreview)} alt="Preview" className="h-24 w-24 object-cover rounded border-2 border-gray-200" />
                </div>
              )}
            </div>

            {/* Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
              <select 
                value={form.type} 
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="customer">👤 Khách hàng</option>
                <option value="supplier">🏢 Nhà cung cấp</option>
                <option value="both">📋 Cả hai</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center space-x-2"
              >
                <i className="fas fa-check"></i>
                <span>{loading ? 'Đang lưu...' : 'Lưu'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;
