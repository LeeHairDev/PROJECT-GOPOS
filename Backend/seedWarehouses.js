require("dotenv").config();
const mongoose = require("mongoose");
const Warehouse = require("./models/Warehouse");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/gopos",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

const seedWarehouses = async () => {
  try {
    await connectDB();

    // Clear existing warehouses
    await Warehouse.deleteMany({});

    const warehouses = [
      {
        name: "Kho bán hàng",
        location: "Thành phố Hồ Chí Minh",
        address: "Số 123, Đường Nguyễn Hữu Cảnh, Quận Bình Thạnh",
        capacity: 1000,
        currentStock: 500,
        status: "active",
        description: "Kho bán lẻ chính, bán trực tiếp cho khách hàng",
        manager: "Nguyễn Văn A",
      },
      {
        name: "Kho chi nhánh",
        location: "Hà Nội",
        address: "Số 456, Đường Trần Hưng Đạo, Quận Hoàn Kiếm",
        capacity: 800,
        currentStock: 400,
        status: "active",
        description: "Kho chi nhánh phía Bắc",
        manager: "Trần Thị B",
      },
      {
        name: "Kho dự trữ",
        location: "Thành phố Hồ Chí Minh",
        address: "Số 789, Đường Hùng Vương, Quận 5",
        capacity: 2000,
        currentStock: 1200,
        status: "active",
        description: "Kho dự trữ lớn, lưu trữ hàng hoá dài hạn",
        manager: "Lê Văn C",
      },
      {
        name: "Kho nhập khẩu",
        location: "Cảng Tân Cảng, Tp.HCM",
        address: "Quay 5, Cảng Tân Cảng, Quận 4",
        capacity: 3000,
        currentStock: 1800,
        status: "active",
        description: "Kho trung chuyển tại cảng, hàng hoá nhập khẩu",
        manager: "Phạm Đức D",
      },
      {
        name: "Kho phân phối",
        location: "Biên Hòa, Đồng Nai",
        address: "Khu công nghiệp Amata, Biên Hòa",
        capacity: 1500,
        currentStock: 900,
        status: "active",
        description: "Kho phân phối cho các cửa hàng vệ tinh",
        manager: "Hoàng Văn E",
      },
    ];

    const result = await Warehouse.insertMany(warehouses);
    console.log(`✅ Tạo thành công ${result.length} kho hàng:`);
    result.forEach((w) => console.log(`   - ${w.name} (${w.location})`));

    mongoose.connection.close();
  } catch (err) {
    console.error("Lỗi seeding warehouse:", err);
    process.exit(1);
  }
};

seedWarehouses();
