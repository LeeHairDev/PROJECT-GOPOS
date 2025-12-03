const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// 1. IMPORT USER ROUTES
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Kết nối MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("Server is running...");
});

// 2. GẮN (MOUNT) USER ROUTES VÀO ĐƯỜNG DẪN /api/users
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
