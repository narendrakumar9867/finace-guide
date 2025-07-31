import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loan",
        required: true,
    },
    eventType: {
        type: String,
        enum: [
            "loan_created",
            "payment_made",
            "payment_missed",
            "loan_completed",
            "reminder_sent",
            "penalty_applied",
            "dashboard_viewed",
            "ai_suggestion_requested"
        ],
        required: true,
    },
    eventDate: {
        amount: Number,
        paymentMethod: String,
        penaltyAmount: Number,
        suggestionType: String,
        metadata: mongoose.Schema.Types.Mixed,
    },
    userAgent: {
        type: String,
    },
    ipAddress: {
        type: String,
    },
    sessionId: {
        type: String,
    },
}, {
    timestamps: true,
});

analyticsSchema.index({
    userId: 1, createdAt: -1
});
analyticsSchema.index({
    loanId: 1, eventType: 1
});
analyticsSchema.index({
    eventType: 1, createdAt: -1
});
analyticsSchema.index({
    createdAt: -1
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;
