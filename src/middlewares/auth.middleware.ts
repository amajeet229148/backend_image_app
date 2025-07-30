import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token";
import { ApiError } from "../utils/apiError";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";

export const authMiddleware = asyncHandler(async ( req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "No token provided");
        }

        const token = authHeader.split(" ")[1];

        const decoded = verifyAccessToken(token) as { userId: string };

        const existingUser = await User.findById(decoded.userId);

        if (!existingUser) {
            throw new ApiError(401, "User no longer exists");
        }

        req.user = existingUser; 

        next();
    } catch (error) {
        next(new ApiError(401, "Invalid or expired token"));
    }
}
)