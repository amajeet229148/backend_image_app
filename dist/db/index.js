"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async (mongo_uri) => {
    if (!mongo_uri) {
        console.error("MongoDB URI is not defined");
    }
    try {
        const connectionInstances = await mongoose_1.default.connect(mongo_uri, {
            dbName: "google_drive_management_system",
        });
        console.log(`MongoDB connected: ${connectionInstances.connection.host}`);
    }
    catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
