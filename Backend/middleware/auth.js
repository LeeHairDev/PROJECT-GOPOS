// Backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Vui lòng cung cấp token để truy cập tài nguyên này",
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "secret_key_123"
      );
      // Load user from DB and attach to request
      req.user = await User.findById(decoded.id);
      // Log for debugging: show which user and role was loaded
      try {
        console.log(
          `[auth] authenticated user id=${decoded.id} role=${req.user?.role}`
        );
      } catch (e) {}
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Lỗi xác thực" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập trước" });
    }

    // Do a case-insensitive role comparison to avoid mismatches like 'Admin' vs 'admin'
    const allowed = roles.map((r) => String(r).toLowerCase());
    const userRole = String(req.user.role || "").toLowerCase();
    if (!allowed.includes(userRole)) {
      console.log(
        `[auth] access denied for user id=${req.user._id} role=${
          req.user.role
        } required=${roles.join(",")}`
      );
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập tài nguyên này" });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
