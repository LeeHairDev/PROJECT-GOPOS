const mongoose = require("mongoose");
const Warehouse = require("./models/Warehouse");
require("dotenv").config();

async function run() {
  try {
    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/gopos";
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to DB");

    // Check if out-of-stock warehouse exists
    let warehouse = await Warehouse.findOne({
      $or: [
        { name: /tạm dừng/i },
        { name: /không bán/i },
        { name: /out of stock/i },
      ],
    });

    if (!warehouse) {
      // Create out-of-stock warehouse
      warehouse = await Warehouse.create({
        name: "Kho tạm dừng bán",
        location: "Tạm dừng",
        address: "Không bán hàng",
        capacity: 0,
        currentStock: 0,
        status: "active",
        description: "Kho chứa các sản phẩm tạm dừng bán hoặc không khả dụng",
        manager: "System",
      });
      console.log(`Created out-of-stock warehouse: ${warehouse.name}`);
    } else {
      console.log(`Out-of-stock warehouse already exists: ${warehouse.name}`);
    }

    await mongoose.disconnect();
    console.log("Done");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
