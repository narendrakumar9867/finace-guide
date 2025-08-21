import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
        required: true,
    },
    installmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Installment',
    },
    reminderType: {
        type: String,
        enum: [
            'payment_due',
            'payment_overdue',
            'penalty_warning',
            'upcoming_payment',
            'loan_completion',
            'document_submission',
            'agreement_signing',
            'custom'
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
    scheduledDate: {
        type: Date,
        required: true,
    },
    dueDate: {
        type: Date,
    },
    amount: {
        type: Number,
        min: 0,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    status: {
        type: String,
        enum: ['scheduled', 'sent', 'delivered', 'failed', 'cancelled', 'expired'],
        default: 'scheduled',
    },
    channels: [{
        type: String,
        enum: ['email', 'sms', 'push', 'in_app'],
        required: true,
    }],
    deliveryAttempts: [{
        channel: {
            type: String,
            enum: ['email', 'sms', 'push', 'in_app'],
        },
        attemptDate: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['success', 'failed', 'pending'],
        },
        errorMessage: String,
        deliveryId: String,
    }],
    frequency: {
        type: String,
        enum: ['once', 'daily', 'weekly', 'monthly'],
        default: 'once',
    },
    recurringConfig: {
        interval: Number, // in days
        maxOccurrences: Number,
        endDate: Date,
        currentOccurrence: {
            type: Number,
            default: 0,
        },
    },
    template: {
        templateName: String,
        templateVariables: mongoose.Schema.Types.Mixed,
    },
    conditions: {
        daysBeforeDue: Number,
        daysAfterDue: Number,
        minimumAmount: Number,
        onlyIfUnpaid: {
            type: Boolean,
            default: true,
        },
        skipIfPartiallyPaid: {
            type: Boolean,
            default: false,
        },
    },
    escalation: {
        escalateAfterDays: Number,
        escalateToUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        escalationMessage: String,
        isEscalated: {
            type: Boolean,
            default: false,
        },
        escalatedAt: Date,
    },
    userResponse: {
        isAcknowledged: {
            type: Boolean,
            default: false,
        },
        acknowledgedAt: Date,
        responseText: String,
        actionTaken: {
            type: String,
            enum: ['payment_made', 'payment_scheduled', 'contact_lender', 'dispute_raised', 'ignored'],
        },
        actionTakenAt: Date,
    },
    metadata: {
        campaignId: String,
        batchId: String,
        source: {
            type: String,
            enum: ['auto_generated', 'manual', 'ai_suggested', 'user_requested'],
            default: 'auto_generated',
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        tags: [String],
        customData: mongoose.Schema.Types.Mixed,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    sentAt: Date,
    deliveredAt: Date,
    expiresAt: Date,
}, {
    timestamps: true,
});


// for the method to marl reminder as sent
reminderSchema.methods.markAsSent = function(channel, deliveryId) {
    this.status = "sent";
    this.sentAt = new Date();

    this.deliveryAttempts.push({
        channel: channel,
        attemptDate: new Date(),
        status: "success",
        deliveryId: deliveryId,
    });

    return this.save();
};


// for the method to mark delivery failure
reminderSchema.methods.markAsFailed = function(channel, errorMessage) {
    this.deliveryAttempts.push({
        channel: channel,
        attemptDate: new Date(),
        status: "failed",
        errorMessage: errorMessage,
    });

    const failedAttempts = this.deliveryAttempts.filter(attempt => attempt.status === "failed");

    if (failedAttempts.length >= this.channels.length) {
        this.status = "failed";
    }

    return this.save();
};


// for the methods to handle user acknowledgment
reminderSchema.methods.acknowledge = function(responseText, actionTaken) {
    this.userResponse.isAcknowledged = true;
    this.userResponse.acknowledgedAt = new Date();
    this.userResponse.responseText = responseText;
    this.userResponse.actionTaken = actionTaken;
    this.userResponse.actionTakenAt = new Date();

    return this.save();
};


// for the method to escalate reminder
reminderSchema.methods.escalate = function() {

    if (this.escalation.escalateAfterDays && this.escalation.escalateToUserId) {
        this.escalation.isEscalated = true;
        this.escalation.escalatedAt = new Date();
        return this.save();
    }

    return Promise.reject(new Error("Escalation not configured"));
};

reminderSchema.index({
    userId: 1, status: 1, scheduledDate: 1
});
reminderSchema.index({
    loanId: 1, reminderType: 1
});
reminderSchema.index({
    scheduledDate: 1, status: 1
});
reminderSchema.index({
    status: 1, isActive: 1
});
reminderSchema.index({
    dueDate: 1, reminderType: 1
});
reminderSchema.index({
    expiresAt: 1
});
reminderSchema.index({
    'escalation.escalateToUserId': 1, 'escalation.isEscalated': 1
});

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;

