import mongoose, { Schema } from "mongoose";

const personalChatSchema = new Schema({
    participant1: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    participant2: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    messages: [
        {
            type: Schema.Types.ObjectId,
            ref: "Message"
        }
    ]
}, { timestamps: true })

export const PersonalChat = mongoose.model("PersonalChat", personalChatSchema)