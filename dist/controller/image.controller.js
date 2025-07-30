"use strict";
/// <reference path="../types/express.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUserImages = exports.deleteImage = exports.updateImage = exports.getImageById = exports.searchImages = exports.getImagesByFolder = exports.uploadImage = void 0;
const image_model_1 = require("../models/image.model");
const folder_model_1 = require("../models/folder.model");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const cloudinary_1 = require("../utils/cloudinary");
const fs_1 = __importDefault(require("fs"));
exports.uploadImage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, folderId } = req.body;
    const userId = req.user?._id;
    if (!name) {
        throw new apiError_1.ApiError(400, "Image name is required");
    }
    if (!folderId) {
        throw new apiError_1.ApiError(400, "Folder ID is required");
    }
    if (!userId) {
        throw new apiError_1.ApiError(401, "User not authenticated");
    }
    const folder = await folder_model_1.Folder.findOne({ _id: folderId, userId });
    if (!folder) {
        throw new apiError_1.ApiError(404, "Folder not found or access denied");
    }
    if (!req.file) {
        throw new apiError_1.ApiError(400, "Image file is required");
    }
    try {
        const cloudinaryResponse = await (0, cloudinary_1.uploadOnCloudinary)(req.file.path, `google-drive-clone/${userId}/${folderId}`);
        if (!cloudinaryResponse) {
            throw new apiError_1.ApiError(500, "Failed to upload image to cloud storage");
        }
        const image = await image_model_1.Image.create({
            name,
            imageUrl: cloudinaryResponse.secure_url,
            folder: folderId,
            user: userId
        });
        const populatedImage = await image_model_1.Image.findById(image._id)
            .populate('folder', 'name')
            .populate('user', 'email');
        return res.status(201).json(new apiResponse_1.ApiResponse(201, populatedImage, "Image uploaded successfully"));
    }
    catch (error) {
        if (req.file && fs_1.default.existsSync(req.file.path)) {
            fs_1.default.unlinkSync(req.file.path);
        }
        throw new apiError_1.ApiError(500, error.message || "Failed to upload image");
    }
});
exports.getImagesByFolder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { folderId } = req.params;
    const userId = req.user?._id;
    if (!userId) {
        throw new apiError_1.ApiError(401, "User not authenticated");
    }
    const folder = await folder_model_1.Folder.findOne({ _id: folderId, userId });
    if (!folder) {
        throw new apiError_1.ApiError(404, "Folder not found or access denied");
    }
    const images = await image_model_1.Image.find({ folder: folderId, user: userId })
        .populate('folder', 'name')
        .sort({ createdAt: -1 });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, images, "Images retrieved successfully"));
});
exports.searchImages = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { query } = req.query;
    const userId = req.user?._id;
    if (!userId) {
        throw new apiError_1.ApiError(401, "User not authenticated");
    }
    if (!query || typeof query !== 'string') {
        throw new apiError_1.ApiError(400, "Search query is required");
    }
    const images = await image_model_1.Image.find({
        user: userId,
        name: { $regex: query, $options: 'i' }
    })
        .populate('folder', 'name')
        .sort({ createdAt: -1 });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, images, `Found ${images.length} images matching "${query}"`));
});
exports.getImageById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { imageId } = req.params;
    const userId = req.user?._id;
    if (!userId) {
        throw new apiError_1.ApiError(401, "User not authenticated");
    }
    const image = await image_model_1.Image.findOne({ _id: imageId, user: userId })
        .populate('folder', 'name')
        .populate('user', 'email');
    if (!image) {
        throw new apiError_1.ApiError(404, "Image not found or access denied");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, image, "Image retrieved successfully"));
});
exports.updateImage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { imageId } = req.params;
    const { name } = req.body;
    const userId = req.user?._id;
    if (!userId) {
        throw new apiError_1.ApiError(401, "User not authenticated");
    }
    if (!name) {
        throw new apiError_1.ApiError(400, "Image name is required");
    }
    const image = await image_model_1.Image.findOneAndUpdate({ _id: imageId, user: userId }, { name }, { new: true }).populate('folder', 'name');
    if (!image) {
        throw new apiError_1.ApiError(404, "Image not found or access denied");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, image, "Image updated successfully"));
});
exports.deleteImage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { imageId } = req.params;
    const userId = req.user?._id;
    if (!userId) {
        throw new apiError_1.ApiError(401, "User not authenticated");
    }
    const image = await image_model_1.Image.findOne({ _id: imageId, user: userId });
    if (!image) {
        throw new apiError_1.ApiError(404, "Image not found or access denied");
    }
    await image_model_1.Image.findByIdAndDelete(imageId);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, null, "Image deleted successfully"));
});
exports.getAllUserImages = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?._id;
    const { page = 1, limit = 20 } = req.query;
    if (!userId) {
        throw new apiError_1.ApiError(401, "User not authenticated");
    }
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const images = await image_model_1.Image.find({ user: userId })
        .populate('folder', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
    const totalImages = await image_model_1.Image.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalImages / limitNum);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, {
        images,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalImages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        }
    }, "Images retrieved successfully"));
});
