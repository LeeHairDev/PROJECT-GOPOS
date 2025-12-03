// Backend/controllers/userController.js
const User = require('../models/User'); // Import Model User để thao tác với DB

// @desc    Tạo một người dùng mới
// @route   POST /api/users
// @access  Public (có thể thêm auth sau)
const createUser = async (req, res) => {
  try {
    // 1. Lấy dữ liệu từ body của request
    const { name, email } = req.body;

    // 2. Kiểm tra dữ liệu đầu vào cơ bản
    if (!name || !email) {
      // Trả về lỗi 400 nếu thiếu trường bắt buộc
      return res.status(400).json({ 
        message: 'Vui lòng cung cấp cả Tên và Email.' 
      });
    }

    // 3. (Tùy chọn) Kiểm tra xem User đã tồn tại chưa (tránh trùng lặp trước khi Mongoose xử lý)
    // Mongoose sẽ tự động kiểm tra do bạn đặt unique: true trong Model, nhưng kiểm tra thủ công có thể cho thông báo lỗi thân thiện hơn.
    // const userExists = await User.findOne({ email });
    // if (userExists) {
    //     return res.status(400).json({ message: 'Email này đã tồn tại trong hệ thống.' });
    // }

    // 4. Tạo User mới trong MongoDB
    const newUser = await User.create({
      name,
      email,
    });

    // 5. Trả về kết quả thành công (201 Created)
    res.status(201).json({
      message: 'Người dùng đã được tạo thành công!',
      data: newUser
    });

  } catch (error) {
    // Xử lý lỗi nếu việc tạo thất bại (Ví dụ: Lỗi trùng lặp email - code 11000)
    
    let message = 'Lỗi Server nội bộ.';
    if (error.code === 11000) {
        message = 'Email này đã được sử dụng (Lỗi trùng lặp).';
        return res.status(400).json({ message });
    }
    
    console.error('Lỗi khi tạo User:', error);
    res.status(500).json({ message });
  }
};

// Xuất hàm để nó có thể được import và sử dụng trong routes/userRoutes.js
module.exports = {
  createUser,
};