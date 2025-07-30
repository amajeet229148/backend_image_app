/// <reference path="../types/express.d.ts" />

import { Folder } from "../models/folder.model";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const createFolder = asyncHandler(async (req, res) => {
    const { name, parentId } = req.body;
    const userId = req.user?._id;

    if (!name) {
        throw new ApiError(400, "Folder name is required");
    }

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    if (parentId) {
        const parentFolder = await Folder.findOne({ _id: parentId, userId });
        if (!parentFolder) {
            throw new ApiError(404, "Parent folder not found or access denied");
        }
    }

    const folder = await Folder.create({
        name,
        parentId: parentId || null,
        userId
    });

    return res.status(201).json(
        new ApiResponse(201, folder, "Folder created successfully")
    );
});

export const getFoldersByParent = asyncHandler(async (req, res) => {
    const { parentId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    // Convert "null" string to actual null for root folders
    const actualParentId = parentId === "null" ? null : parentId;

    const folders = await Folder.find({
        parentId: actualParentId,
        userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, folders, "Folders retrieved successfully")
    );
});

export const getFolderById = asyncHandler(async (req, res) => {
    const { folderId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const folder = await Folder.findOne({ _id: folderId, userId });

    if (!folder) {
        throw new ApiError(404, "Folder not found or access denied");
    }

    return res.status(200).json(
        new ApiResponse(200, folder, "Folder retrieved successfully")
    );
});

export const updateFolder = asyncHandler(async (req, res) => {
    const { folderId } = req.params;
    const { name } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    if (!name) {
        throw new ApiError(400, "Folder name is required");
    }

    const folder = await Folder.findOneAndUpdate(
        { _id: folderId, userId },
        { name },
        { new: true }
    );

    if (!folder) {
        throw new ApiError(404, "Folder not found or access denied");
    }

    return res.status(200).json(
        new ApiResponse(200, folder, "Folder updated successfully")
    );
});

export const deleteFolder = asyncHandler(async (req, res) => {
    const { folderId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const folder = await Folder.findOne({ _id: folderId, userId });

    if (!folder) {
        throw new ApiError(404, "Folder not found or access denied");
    }

    // Check if folder has subfolders
    const subfolders = await Folder.find({ parentId: folderId, userId });
    if (subfolders.length > 0) {
        throw new ApiError(400, "Cannot delete folder with subfolders");
    }

    await Folder.findByIdAndDelete(folderId);

    return res.status(200).json(
        new ApiResponse(200, null, "Folder deleted successfully")
    );
});