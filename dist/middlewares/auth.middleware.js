"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const token_1 = require("../utils/token");
const apiError_1 = require("../utils/apiError");
const user_model_1 = require("../models/user.model");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.authMiddleware = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new apiError_1.ApiError(401, "No token provided");
        }
        const token = authHeader.split(" ")[1];
        const decoded = (0, token_1.verifyAccessToken)(token);
        const existingUser = await user_model_1.User.findById(decoded.userId);
        if (!existingUser) {
            throw new apiError_1.ApiError(401, "User no longer exists");
        }
        req.user = existingUser;
        next();
    }
    catch (error) {
        next(new apiError_1.ApiError(401, "Invalid or expired token"));
    }
});
