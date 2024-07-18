import mongoose, { Schema } from "mongoose";

const groupChatSchema = new Schema({
    groupName: {
        type: String,
        required: true
    },
    groupIcon: {
        type: String,
        required: true
    },
    groupDescription: {
        type: String
    },
    participants: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    admins: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    messages: [
        {
            type: Schema.Types.ObjectId,
            ref: "Message"
        }
    ]
}, { timestamps: true }) 

export const GroupChat = mongoose.model("GroupChat", groupChatSchema)