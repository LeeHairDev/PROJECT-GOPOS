import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Auto check-in after login using local date
        try {
          const now = new Date();
          const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const checkInRes = await fetch('http://localhost:5000/api/attendance/check-in', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.token}`,
            },
            body: JSON.stringify({
              employeeId: data.user._id,
              date: localDate,
            }),
          });
          
          if (checkInRes.ok) {
            const checkInData = await checkInRes.json();
            alert(`✓ Đăng nhập thành công - Vào lúc ${checkInData.attendance.checkInTime}`);
          } else {
            alert('Đăng nhập thành công (Check-in không tự động)');
          }
        } catch (checkInErr) {
          console.error('Auto check-in error:', checkInErr);
          alert('Đăng nhập thành công (Check-in không tự động)');
        }
        
        onLogin?.();
      } else if (data && data.message) {
        alert('Lỗi: ' + data.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Lỗi khi đăng nhập');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full m-4">
        <div className="text-center mb-6">
          <div className="bg-blue-100 w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-pills text-blue-600 text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-blue-600">GoPOS</h1>
          <p className="text-gray-500 text-sm">Hệ thống quản lý bán hàng</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@test.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-1">Tài khoản test:</p>
          <p>Email: admin@test.com</p>
          <p>Password: 123456</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
