const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }
    await mongoose.connect(uri);
    console.log("MongoDB is connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1)
  }
};

module.exports = dbConnection;
