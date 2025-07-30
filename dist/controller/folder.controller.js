"use strict";
/// <reference path="../types/express.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFolder = exports.updateFolder = exports.getFolderById = exports.getFoldersByParent = exports.createFolder = void 0;
const folder_model_1 = require("../models/folder.model");
const apiError_1 = require("../utils/apiError");
const apiResponse_1 = require("../utils/apiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.createFolder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, parentId } = req.body;
    const userId = req.user?._id;
    if (!name) {
        throw new apiError_1.ApiError(400, "Folder name is required");
    }
    if (!userId) {
        throw new apiError_1.ApiError(401, "User not authenticated");
    }
    if (parentId) {
        const parentFolder = await folder_model_1.Folder.findOne({ _id: parentId, userId });
        if (!parentFolder) {
            throw new apiError_1.ApiError(404, "Parent folder not found or access denied");
        }
    }
    const folder = await folder_model_1.Folder.create({
        name,
        parentId: parentId || null,
        userId
    });
    return res.status(201).json(new apiResponse_1.ApiResponse(201, folder, "Folder created successfully"));
});
exports.getFoldersByParent = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { parentId } = req.params;
    const userId = req.user?._id;
    if (!userId) {
        throw new apiError_1.ApiError(401, "User not authenticated");
    }
    // Convert "null" string to actual null for root folders
    const actualParentId = parentId === "null" ? null : parentId;
    const folders = await folder_model_1.Folder.find({
        parentId: actualParentId,
        userId,
    }).sort({ createdAt: -1 });
    return res.status(200).json(new apiResponse_1.ApiResponse(200, folders, "Folders retrieved successfully"));
});
exports.getFolderById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { folderId } = req.params;
    const userId = req.user?._id;
    if (!userId) {
        throw new apiError_1.ApiError(401, "User not authenticated");
    }
    const folder = await folder_model_1.Folder.findOne({ _id: folderId, userId });
    if (!folder) {
        throw new apiError_1.ApiError(404, "Folder not found or access denied");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, folder, "Folder retrieved successfully"));
});
exports.updateFolder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { folderId } = req.params;
    const { name } = req.body;
    const userId = req.user?._id;
    if (!userId) {
        throw new apiError_1.ApiError(401, "User not authenticated");
    }
    if (!name) {
        throw new apiError_1.ApiError(400, "Folder name is required");
    }
    const folder = await folder_model_1.Folder.findOneAndUpdate({ _id: folderId, userId }, { name }, { new: true });
    if (!folder) {
        throw new apiError_1.ApiError(404, "Folder not found or access denied");
    }
    return res.status(200).json(new apiResponse_1.ApiResponse(200, folder, "Folder updated successfully"));
});
exports.deleteFolder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { folderId } = req.params;
    const userId = req.user?._id;
    if (!userId) {
        throw new apiError_1.ApiError(401, "User not authenticated");
    }
    const folder = await folder_model_1.Folder.findOne({ _id: folderId, userId });
    if (!folder) {
        throw new apiError_1.ApiError(404, "Folder not found or access denied");
    }
    // Check if folder has subfolders
    const subfolders = await folder_model_1.Folder.find({ parentId: folderId, userId });
    if (subfolders.length > 0) {
        throw new apiError_1.ApiError(400, "Cannot delete folder with subfolders");
    }
    await folder_model_1.Folder.findByIdAndDelete(folderId);
    return res.status(200).json(new apiResponse_1.ApiResponse(200, null, "Folder deleted successfully"));
});
