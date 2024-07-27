import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js" 
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessandRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Internal Server Error [Token generation error]")
    }
}

const registerUser = asyncHandler( async(req,res) => {
    const { username, fullName, email, password } = req.body;
    if( [fullName, username, email, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(400, "User with given email or username already exists")
    }

    const profilePictureLocalPath = req.file?.path
    if(!profilePictureLocalPath){
        throw new ApiError(400, "Profile picture is required")
    }
    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath)
    if(!profilePicture){
        throw new ApiError(400, "Profile picture is required")
    }

    const user = await User.create({
        fullName,
        username,
        email,
        password,
        profilePicture: profilePicture.url,
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500, "Internal server error during registration : Try again later")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const loginUser = asyncHandler( async(req,res) => {
    const { email, username, password } = req.body
    if(!username && !email){
        throw new ApiError(400, "Username or Email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(!user){
        throw new ApiError(400, "User doesn't exist. Please Register")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
        throw new ApiError(400, "Incorrect password")
    }

    const { accessToken, refreshToken } = await generateAccessandRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User logged in successfully"
    ))
})

const logoutUser = asyncHandler( async(req,res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
}