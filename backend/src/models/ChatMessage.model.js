import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    consversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatConversation',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    messageType: {
        type: String,
        enum: [
            "user",
            "ai",
            "system",
        ],
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    aiResponse: {
        suggestionType: {
            type: String,
            enum: [
                "payment_plan",
                "penalty_explanation",
                "general_advice",
                "loan_calculation",
            ],
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1,
        },
        tokensUsed: Number,
        responseTime: Number,  // milliseconds
        modelUsed: {
            type: String,
            default: "gpt-3.5-turbo",
        },
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number,
    }],
    metadata: {
        isEdited: {
            type: Boolean,
            default: false,
        },
        editedAt: Date,
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: Date,
        reactions: [{
            emoji: String,
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

chatMessageSchema.index({
    consversationId: 1, createdAt: 1
});
chatMessageSchema.index({
    userId: 1, messageType: 1
});
chatMessageSchema.index({
    messageType: 1, createdAt: -1
});

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;
