import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { generateAccessToken, generateRefreshToken } from "../utils/token";

export const registerUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(400, "User already exists with this email");
    }

    const user = await User.create({
        email,
        password
    })

    if (!user) {
        throw new ApiError(500, "User registration failed");
    }

    const createUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createUser) {
        throw new ApiError(500, "User not found");
    }

    return res.status(201).json(
        new ApiResponse(201, createUser, "User registered successfully")
    )
})

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(401, "email or password is missing both are required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User not found with this email")
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const accessToken = generateAccessToken(String(user._id));
    const refreshToken = generateRefreshToken(String(user._id));

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            }, "User logged in successfully")
        )
})