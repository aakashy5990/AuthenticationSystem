import mongoose from "mongoose";
import 'dotenv/config'

const connectDB = async () => {
    try{
        if(!process.env.MONGODB_URL){
            throw new Error('Mongo_URL environment variable is not defined. Please check your .env file.');
        }

        mongoose.connection.on('connected', () => {
            console.log('✅ MongoDB Connected Successfully');
        })

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB Connection Error:', err);
        })

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB Disconnected');
        })

        await mongoose.connect(`${process.env.MONGODB_URL}/mern-auth`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }catch(error){
        console.error('❌ Database Connection Failed:', error.message);
        process.exit(1);
    }
}

export default connectDB;