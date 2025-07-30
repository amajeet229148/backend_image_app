"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadOnCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
cloudinary_1.v2.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});
const uploadOnCloudinary = async (filePath, folder) => {
    try {
        if (!filePath || !folder) {
            throw new Error("File path and folder are required");
        }
        const response = await cloudinary_1.v2.uploader.upload(filePath, {
            resource_type: "auto",
            folder: folder,
        });
        fs_1.default.unlinkSync(filePath);
        return response;
    }
    catch (error) {
        fs_1.default.unlinkSync(filePath);
        console.error(`Error uploading to Cloudinary: ${error.message}`);
    }
};
exports.uploadOnCloudinary = uploadOnCloudinary;
