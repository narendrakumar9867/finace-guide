import mongoose from "mongoose";

const chatConversationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loan",
        default: null,
    },
    title: {
        type: String,
        default: "New Conversation",
        trim: true,
    },
    status: {
        type: String,
        enum: ["active", "archived", "closed"],
        default: "active",
    },
    conversationType: {
        type: String,
        enum: [
            "general",
            "loan_specific",
            "payment_guidance",
            "penalty_query",
        ],
    },
    metadata: {
        totalMessages: {
            type: Number,
            default: 0,
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
        aiSuggestionsCount: {
            type: Number,
            min: 1,
            max: 5,
        },
    },
    tags: [{
        type: String,
        trim: true,
    }],
    isArchived: {
        type: Boolean,
        default: false,
    }, 
}, {
    timestamps: true,
});

chatConversationSchema.index({
    userId: 1, createdAt: -1
});
chatConversationSchema.index({
    loanId: 1
});
chatConversationSchema.index({
    status: 1, updatedAt: -1
});

const ChatConversation = mongoose.model("ChatConversation", chatConversationSchema);

export default ChatConversation;
