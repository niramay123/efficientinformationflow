import mongoose from "mongoose";

export const connectDB = async (req,res)=>{
    try {
        
        const connection = await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log(error);
    }
}