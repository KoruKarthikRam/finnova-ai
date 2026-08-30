const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables (.env file).");
    }

    // Set Google and Cloudflare DNS fallback servers to resolve SRV record lookup issues (ESERVFAIL) on Node/Windows
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
    } catch (e) {
      // Fallback silently if environment prevents custom DNS settings
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("👉 Please ensure MongoDB is running locally or check your MONGODB_URI in backend/.env.");
  }
};

module.exports = connectDB;

