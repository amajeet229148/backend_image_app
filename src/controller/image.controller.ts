/// <reference path="../types/express.d.ts" />

import { Image } from "../models/image.model";
import { Folder } from "../models/folder.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import fs from "fs";

export const uploadImage = asyncHandler(async (req, res) => {
    const { name, folderId } = req.body;
    const userId = req.user?._id;

    if (!name) {
        throw new ApiError(400, "Image name is required");
    }

    if (!folderId) {
        throw new ApiError(400, "Folder ID is required");
    }

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const folder = await Folder.findOne({ _id: folderId, userId });
    if (!folder) {
        throw new ApiError(404, "Folder not found or access denied");
    }

    if (!req.file) {
        throw new ApiError(400, "Image file is required");
    }

    try {
        const cloudinaryResponse = await uploadOnCloudinary(
            req.file.path,
            `google-drive-clone/${userId}/${folderId}`
        );

        if (!cloudinaryResponse) {
            throw new ApiError(500, "Failed to upload image to cloud storage");
        }

        const image = await Image.create({
            name,
            imageUrl: cloudinaryResponse.secure_url,
            folder: folderId,
            user: userId
        });

        const populatedImage = await Image.findById(image._id)
            .populate('folder', 'name')
            .populate('user', 'email');

        return res.status(201).json(
            new ApiResponse(201, populatedImage, "Image uploaded successfully")
        );

    } catch (error: any) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        throw new ApiError(500, error.message || "Failed to upload image");
    }
});

export const getImagesByFolder = asyncHandler(async (req, res) => {
    const { folderId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const folder = await Folder.findOne({ _id: folderId, userId });
    if (!folder) {
        throw new ApiError(404, "Folder not found or access denied");
    }

    const images = await Image.find({ folder: folderId, user: userId })
        .populate('folder', 'name')
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, images, "Images retrieved successfully")
    );
});

export const searchImages = asyncHandler(async (req, res) => {
    const { query } = req.query;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    if (!query || typeof query !== 'string') {
        throw new ApiError(400, "Search query is required");
    }

    const images = await Image.find({
        user: userId,
        name: { $regex: query, $options: 'i' }
    })
    .populate('folder', 'name')
    .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, images, `Found ${images.length} images matching "${query}"`)
    );
});

export const getImageById = asyncHandler(async (req, res) => {
    const { imageId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const image = await Image.findOne({ _id: imageId, user: userId })
        .populate('folder', 'name')
        .populate('user', 'email');

    if (!image) {
        throw new ApiError(404, "Image not found or access denied");
    }

    return res.status(200).json(
        new ApiResponse(200, image, "Image retrieved successfully")
    );
});

export const updateImage = asyncHandler(async (req, res) => {
    const { imageId } = req.params;
    const { name } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    if (!name) {
        throw new ApiError(400, "Image name is required");
    }

    const image = await Image.findOneAndUpdate(
        { _id: imageId, user: userId },
        { name },
        { new: true }
    ).populate('folder', 'name');

    if (!image) {
        throw new ApiError(404, "Image not found or access denied");
    }

    return res.status(200).json(
        new ApiResponse(200, image, "Image updated successfully")
    );
});

export const deleteImage = asyncHandler(async (req, res) => {
    const { imageId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const image = await Image.findOne({ _id: imageId, user: userId });

    if (!image) {
        throw new ApiError(404, "Image not found or access denied");
    }

    await Image.findByIdAndDelete(imageId);

    return res.status(200).json(
        new ApiResponse(200, null, "Image deleted successfully")
    );
});

export const getAllUserImages = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const images = await Image.find({ user: userId })
        .populate('folder', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    const totalImages = await Image.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalImages / limitNum);

    return res.status(200).json(
        new ApiResponse(200, {
            images,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalImages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        }, "Images retrieved successfully")
    );
});