// Backend/addProducts.js - Script thêm 50 sản phẩm vào các danh mục hiện có
const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");
const Category = require("./models/Category");
const connectDB = require("./config/db");

// Danh sách tên sản phẩm theo danh mục
const productNamesByCategory = {
  "Thuốc kháng sinh": [
    "Amoxicillin 500mg",
    "Ciprofloxacin",
    "Doxycycline",
    "Erythromycin",
    "Cephalexin",
    "Penicillin V",
    "Azithromycin",
    "Levofloxacin",
    "Trimethoprim",
    "Cefixime",
    "Nystatin",
    "Sulfamethoxazole",
    "Clindamycin",
    "Metronidazole",
  ],
  "Thuốc giảm đau": [
    "Paracetamol 500mg",
    "Ibuprofen",
    "Aspirin",
    "Diclofenac",
    "Naproxen",
    "Indomethacin",
    "Ketoprofen",
    "Meloxicam",
    "Celecoxib",
    "Paracetamol Extra",
    "Ibuprofen PM",
    "Aspirin Protect",
    "Acetaminophen",
    "Tramadol",
  ],
  Vitamin: [
    "Vitamin C 1000mg",
    "Vitamin D3",
    "Vitamin B Complex",
    "Vitamin E 400IU",
    "Vitamin A 5000IU",
    "Folic Acid",
    "Vitamin B12",
    "Vitamin K2",
    "Biotin",
    "Pantothenic Acid",
    "Niacin",
    "Thiamine",
    "Riboflavin",
    "Pyridoxine",
  ],
  "Thực phẩm chức năng": [
    "Sữa nước cốt dừa",
    "Nước cam tươi",
    "Sữa hạt macadamia",
    "Nước chanh tươi",
    "Sữa óc chó",
    "Nước dứa tự nhiên",
    "Sữa gạo",
    "Nước lựu tươi",
    "Sữa đậu nành",
    "Nước trái cây hỗn hợp",
    "Nước dâu tây",
    "Sữa hạnh nhân",
    "Nước gừng tươi",
    "Sữa yến mạch",
  ],
};

const addProducts = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Lấy tất cả danh mục
    const categories = await Category.find();
    if (categories.length === 0) {
      console.log("Không có danh mục nào! Vui lòng tạo danh mục trước.");
      process.exit(1);
    }

    console.log(`Found ${categories.length} categories`);

    const productsToAdd = [];
    let skuIndex = 1000; // Bắt đầu từ SP1000

    // Chia 50 sản phẩm đều vào các danh mục
    const productsPerCategory = Math.ceil(50 / categories.length);

    categories.forEach((category) => {
      const names = productNamesByCategory[category.name] || [];

      // Thêm sản phẩm cho danh mục này
      for (
        let i = 0;
        i < productsPerCategory && productsToAdd.length < 50;
        i++
      ) {
        // Lấy tên sản phẩm, nếu hết thì tạo tên mới
        let productName;
        if (i < names.length) {
          productName = names[i];
        } else {
          productName = `${category.name} - Sản phẩm ${i + 1}`;
        }

        const sku = `SP${skuIndex++}`;
        const price = Math.floor(Math.random() * 500000) + 10000; // 10k..500k
        const quantity = Math.floor(Math.random() * 500) + 10; // 10..500

        productsToAdd.push({
          name: productName,
          description: `${productName} - Chất lượng tốt`,
          sku,
          barcode: `BARCODE${skuIndex}`,
          price,
          quantity,
          category: category._id,
          status: "active",
          createdAt: new Date(),
        });
      }
    });

    // Thêm sản phẩm vào database
    const created = await Product.insertMany(productsToAdd);
    console.log(`✅ Đã thêm ${created.length} sản phẩm thành công!`);

    // Hiển thị thống kê
    console.log("\n📊 Thống kê sản phẩm theo danh mục:");
    for (const category of categories) {
      const count = await Product.countDocuments({ category: category._id });
      console.log(`  - ${category.name}: ${count} sản phẩm`);
    }

    const totalProducts = await Product.countDocuments();
    console.log(`\n📈 Tổng cộng: ${totalProducts} sản phẩm`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
  }
};

addProducts();
