"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const user_model_1 = require("../models/user.model");
const apiError_1 = require("../utils/apiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const token_1 = require("../utils/token");
exports.registerUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new apiError_1.ApiError(400, "Email and password are required");
    }
    const existingUser = await user_model_1.User.findOne({ email });
    if (existingUser) {
        throw new apiError_1.ApiError(400, "User already exists with this email");
    }
    const user = await user_model_1.User.create({
        email,
        password
    });
    if (!user) {
        throw new apiError_1.ApiError(500, "User registration failed");
    }
    const createUser = await user_model_1.User.findById(user._id).select("-password -refreshToken");
    if (!createUser) {
        throw new apiError_1.ApiError(500, "User not found");
    }
    return res.status(201).json(new apiResponse_1.ApiResponse(201, createUser, "User registered successfully"));
});
exports.loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new apiError_1.ApiError(401, "email or password is missing both are required");
    }
    const user = await user_model_1.User.findOne({ email });
    if (!user) {
        throw new apiError_1.ApiError(404, "User not found with this email");
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        throw new apiError_1.ApiError(401, "Invalid user credentials");
    }
    const accessToken = (0, token_1.generateAccessToken)(String(user._id));
    const refreshToken = (0, token_1.generateRefreshToken)(String(user._id));
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    const loggedInUser = await user_model_1.User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    };
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse_1.ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken
    }, "User logged in successfully"));
});
