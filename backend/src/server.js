require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/transactions", transactionRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "FinNova AI Backend is running!",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});