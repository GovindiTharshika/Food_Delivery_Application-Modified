const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "config", "config.env") });

const cloudinary = require("cloudinary");
const app = require("./app");
const connectDatabase = require("./config/database");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

connectDatabase();

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Server started on PORT: ${port} in ${process.env.NODE_ENV} mode.`);
});

process.on("unhandledRejection", (error) => {
  console.error(`Unhandled promise rejection: ${error.message}`);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (error) => {
  console.error(`Uncaught exception: ${error.message}`);
  server.close(() => process.exit(1));
});
