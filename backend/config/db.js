import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB Connected..");
  } catch (error) {
    console.error("DB Connection failed:", error.message);
    process.exit(1);
  }
};
