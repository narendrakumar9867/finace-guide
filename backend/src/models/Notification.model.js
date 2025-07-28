import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loan",
    },
    installmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Installment",
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
    },
    type: {
        type: String,
        enum: [
            'payment_reminder',
            'payment_overdue',
            'payment_received',
            'loan_approved',
            'loan_rejected',
            'loan_completed',
            'penalty_applied',
            'system_update',
            'ai_suggestion',
            'document_required',
            'agreement_signed'
        ],
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    priority: {
        type: String,
        enum: [
            "low", "medium", "high", "urgent"
        ],
        default: "medium",
    },
    status: {
        type: String,
        enum: [
            "sent", "delivered", "read", "failed"
        ],
        default: "sent",
    },
    channels: [{
        type: String,
        enum: [
            "in_app", "email", "sms", "push"
        ],
    }],
    deliveryStatus: {
        inApp: {
            status: {
                type: String,
                enum: [
                    "pending", "delivered", "read", "failed"
                ],
                default: "pending",
            },
            deliveredAt: Date,
            readAt: Date,
        },
        email: {
            status: {
                type: String,
                enum: [
                    "pending", "sent", "delivered", "failed", "bounced"
                ],
                default: "pending",
            },
            sentAt: Date,
            deliveredAt: Date,
            errorMessage: String,
        },
        sms: {
            status: {
                type: String,
                enum: [
                    "pending", "sent", "delivered", "failed"
                ],
                default: "pending",
            },
            sentAt: Date,
            deliveredAt: Date,
            errorMessage: String,
        },
        push: {
            status: {
                type: String,
                enum: [
                    "pending", "sent", "delivered", "failed"
                ],
                default: "pending",
            },
            sentAt: Date,
            deliveredAt: Date,
            errorMessage: String,
        },
    },
    date: {
        amount: Number,
        dueDate: Date,
        daysOverdue: Number,
        actionUrl: String,
        buttonText: String,
        metadata: mongoose.Schema.Types.Mixed,
    },
    scheduledFor: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    readAt: {
        type: Date,
    },
    actionTaken: {
        type: Boolean,
        default: false,
    },
    actionTakenAt: {
        type: Date,
    },
    retryCount: {
        type: Number,
        default: 0,
        max: 3,
    },
    lastRetryAt: {
        type: Date,
    },
    template: {
        templateId: String,
        templateVariables: mongoose.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});

notificationSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    this.deliveryStatus.inApp.status = "read";
    this.deliveryStatus.inApp.readAt = new Date();
    return this.save();
};


notificationSchema.methods.markActionTaken = function() {
    this.actionTaken = true;
    this.actionTakenAt = new Date();
    return this.save();
};

// Indexes for notification queries
notificationSchema.index({
    userId: 1, isRead: 1, createdAt: -1
});
notificationSchema.index({
    loanId: 1, type: 1
});
notificationSchema.index({
    type: 1, scheduledFor: 1
});
notificationSchema.index({
    status: 1, scheduledFor: 1
});
notificationSchema.index({
    expiresAt: 1
});
notificationSchema.index({
    priority: 1, createdAt: -1
});


const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
