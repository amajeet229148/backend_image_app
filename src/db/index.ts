import mongoose from 'mongoose';

export const connectDB = async (mongo_uri: string) => {
    if (!mongo_uri) {
        console.error("MongoDB URI is not defined");
    }
    try {
        const connectionInstances = await mongoose.connect(mongo_uri, {
            dbName: "google_drive_management_system",
        });
        console.log(`MongoDB connected: ${connectionInstances.connection.host}`);
    } catch (error: any) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}