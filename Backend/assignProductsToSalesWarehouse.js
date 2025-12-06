const mongoose = require("mongoose");
const Product = require("./models/Product");
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

    // Try to find sales warehouse by name
    let warehouse = await Warehouse.findOne({ name: /Kho bán hàng/i });
    if (!warehouse) {
      warehouse = await Warehouse.findOne();
      if (!warehouse) {
        console.error("No warehouses found. Please create a warehouse first.");
        process.exit(1);
      }
      console.log(
        `No exact 'Kho bán hàng' found, using first warehouse: ${warehouse.name}`
      );
    } else {
      console.log(`Found sales warehouse: ${warehouse.name}`);
    }

    const res = await Product.updateMany(
      { $or: [{ warehouse: { $exists: false } }, { warehouse: null }] },
      { $set: { warehouse: warehouse._id } }
    );
    console.log(
      `Updated ${
        res.modifiedCount || res.nModified || 0
      } products to warehouse ${warehouse.name}`
    );

    await mongoose.disconnect();
    console.log("Done");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
