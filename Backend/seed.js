// Backend/seed.js - Script tạo dữ liệu test
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Order = require("./models/Order");
const Customer = require("./models/Customer");
const StockMovement = require("./models/StockMovement");

const connectDB = require("./config/db");

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    console.log("Cleared existing data");

    // Create user (User model will hash password in pre-save hook)
    const user = await User.create({
      name: "Nguyễn Văn A",
      email: "admin@test.com",
      password: "123456", // Let User model hash this
      phone: "0912345678",
      role: "admin",
    });
    console.log("Created user:", user.email);

    // Create categories
    const categories = await Category.create([
      { name: "Thuốc kháng sinh", description: "Các loại thuốc kháng sinh" },
      { name: "Thuốc giảm đau", description: "Các loại thuốc giảm đau" },
      { name: "Vitamin", description: "Các loại vitamin" },
      {
        name: "Thực phẩm chức năng",
        description: "Các loại thực phẩm chức năng",
      },
    ]);
    console.log("Created categories:", categories.length);

    // Create products - keep some base products then generate until totalCount
    const baseProducts = [
      {
        name: "Amoxicol",
        description: "Thuốc kháng sinh",
        sku: "SP001",
        price: 50000,
        quantity: 120,
        category: categories[0]._id,
        status: "active",
      },
      {
        name: "Panadol Extra",
        description: "Thuốc giảm đau, hạ sốt",
        sku: "SP002",
        price: 18000,
        quantity: 85,
        category: categories[1]._id,
        status: "active",
      },
      {
        name: "Vitamin C",
        description: "Vitamin C 500mg",
        sku: "SP003",
        price: 75000,
        quantity: 200,
        category: categories[2]._id,
        status: "active",
      },
      {
        name: "Bia Tiger",
        description: "Nước uống bổ sung",
        sku: "SP004",
        price: 25000,
        quantity: 50,
        category: categories[3]._id,
        status: "active",
      },
      {
        name: "Gống kính",
        description: "Gống kính chính hãng",
        sku: "SP005",
        price: 120000,
        quantity: 30,
        category: categories[3]._id,
        status: "active",
      },
    ];

    const totalCount = 105;
    const productsToCreate = [];

    // push base products
    baseProducts.forEach((p) => productsToCreate.push(p));

    // generate additional mock products
    let nextIndex = baseProducts.length + 1;
    while (productsToCreate.length < totalCount) {
      const sku = `SP${String(nextIndex).padStart(3, "0")}`;
      const name = `Sản phẩm ${nextIndex}`;
      const price = Math.floor(Math.random() * 90000) + 1000; // 1k..90k
      const quantity = Math.floor(Math.random() * 300); // 0..299
      const category =
        categories[Math.floor(Math.random() * categories.length)]._id;

      productsToCreate.push({
        name,
        description: `${name} mô tả`,
        sku,
        price,
        quantity,
        category,
        status: "active",
      });

      nextIndex++;
    }

    const products = await Product.create(productsToCreate);
    console.log("Created products:", products.length);

    // Create some customers
    const customers = await Customer.create([
      {
        name: "Khách hàng A",
        email: "khA@test.com",
        phone: "0901111111",
        address: "Hà Nội",
        type: "customer",
      },
      {
        name: "Khách hàng B",
        email: "khB@test.com",
        phone: "0902222222",
        address: "TP HCM",
        type: "supplier",
      },
    ]);
    console.log("Created customers:", customers.length);

    // Create stock movements (sample imports and exports)
    const movements = await StockMovement.create([
      {
        product: products[0]._id,
        type: "in",
        quantity: 50,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        reference: "PN-001",
      },
      {
        product: products[1]._id,
        type: "in",
        quantity: 30,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
        reference: "PN-002",
      },
      {
        product: products[2]._id,
        type: "in",
        quantity: 100,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
        reference: "PN-003",
      },
      {
        product: products[0]._id,
        type: "out",
        quantity: 10,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        reference: "PX-001",
        customer: customers[0]._id,
      },
      {
        product: products[1]._id,
        type: "out",
        quantity: 5,
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        reference: "PX-002",
        customer: customers[1]._id,
      },
    ]);
    console.log("Created stock movements:", movements.length);

    // Create orders
    const orders = await Order.create([
      {
        orderNumber: `ORD-${Date.now()}-1`,
        user: user._id,
        items: [
          {
            product: products[0]._id,
            quantity: 2,
            price: 50000,
            subtotal: 100000,
          },
          {
            product: products[1]._id,
            quantity: 1,
            price: 18000,
            subtotal: 18000,
          },
        ],
        total: 118000,
        discount: 0,
        tax: 11800,
        finalTotal: 129800,
        paymentMethod: "cash",
        customerName: "Nguyễn Văn B",
        customerPhone: "0987654321",
        status: "completed",
        paymentStatus: "paid",
        notes: "Giao nhanh",
      },
      {
        orderNumber: `ORD-${Date.now()}-2`,
        user: user._id,
        items: [
          {
            product: products[2]._id,
            quantity: 3,
            price: 75000,
            subtotal: 225000,
          },
        ],
        total: 225000,
        discount: 0,
        tax: 22500,
        finalTotal: 247500,
        paymentMethod: "card",
        customerName: "Trần Thị C",
        customerPhone: "0912111111",
        status: "pending",
        paymentStatus: "unpaid",
        notes: "",
      },
    ]);
    console.log("Created orders:", orders.length);

    console.log("\n✅ Database seeded successfully!");
    console.log("\nTest credentials:");
    console.log("Email: admin@test.com");
    console.log("Password: 123456");

    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDatabase();
