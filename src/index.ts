import { app } from "./app";
import { connectDB } from "./db";
import dotenv from 'dotenv';
dotenv.config();

connectDB(process.env.MONGO_URI!)
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    })
}).catch((error: any) => {
    console.error(`Failed to connect to the database: ${error.message}`);
} )