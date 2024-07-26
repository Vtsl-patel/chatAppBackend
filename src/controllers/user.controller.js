import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js" 
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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

export {
    registerUser,
}