const dns = require("dns");
const mongoose = require("mongoose");

const connectDatabase = async () => {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);

  try {
    await mongoose.connect(process.env.DB_LOCAL_URI);
    console.log(`MongoDB Database connected with HOST:${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDatabase;
