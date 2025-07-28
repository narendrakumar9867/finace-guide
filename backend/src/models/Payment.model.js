import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    installmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Installment",
    },
    payerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    principalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    interestAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    penaltyAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    paymentDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    dueDate: {
        type: Date,
    },
    paymentMethod: {
        type: String,
        enum: [
            "cash", "bank_transfer", "upi", "card", "cheque", "online", "other"
        ],
        required: true,
    },
    paymentType: {
        type: String,
        enum: ['installment', 'partial', 'advance', 'penalty', 'full_payment'],
        default: 'installment',
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
        default: 'pending',
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true,
    },
    paymentGateway: {
        gateway: {
            type: String,
            enum: ['razorpay', 'stripe', 'paypal', 'paytm', 'phonepe', 'manual'],
        },
        gatewayTransactionId: String,
        gatewayResponse: mongoose.Schema.Types.Mixed,
        gatewayFee: {
            type: Number,
            default: 0,
        },
    },
    bankDetails: {
        accountNumber: String,
        ifscCode: String,
        bankName: String,
        chequeNumber: String,
        chequeDate: Date,
    },
    receipt: {
        receiptNumber: {
            type: String,
            unique: true,
            sparse: true,
        },
        receiptUrl: String,
        isGenerated: {
            type: Boolean,
            default: false,
        },
        generatedAt: Date,
    },
    verification: {
        isVerified: {
            type: Boolean,
            default: false,
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        verifiedAt: Date,
        verificationNotes: String,
    },
    metadata: {
        isEarlyPayment: {
            type: Boolean,
            default: false,
        },
        daysEarly: {
            type: Number,
            default: 0,
        },
        isLatePayment: {
            type: Boolean,
            default: false,
        },
        daysLate: {
            type: Number,
            default: 0,
        },
        paymentSource: {
            type: String,
            enum: ['mobile_app', 'web_portal', 'admin_panel', 'manual_entry'],
            default: 'mobile_app',
        },
        ipAddress: String,
        userAgent: String,
        deviceInfo: mongoose.Schema.Types.Mixed,
    },
    notes: {
        type: String,
        trim: true,
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    refund: {
        isRefunded: {
            type: Boolean,
            default: false,
        },
        refundAmount: Number,
        refundDate: Date,
        refundReason: String,
        refundTransactionId: String,
    },
}, {
    timestamps: true,
});


// for generate receipt number before saving
paymentSchema.pre("save", function(next) {

    if (this.isNew && !this.receipt.receiptNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");

        this.receipt.receiptNumber = `RCP${year}${month}${day}${random}`;
    }

    if (this.dueDate) {
        const paymentDate = new Date(this.paymentDate);
        const dueDate = new Date(this.dueDate);
        const diffTime = paymentDate - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            this.metadata.isEarlyPayment = true;
            this.metadata.daysEarly = Math.abs(diffDays);
        } else if (diffDays > 0) {
            this.metadata.isLatePayment = true;
            this.metadata.daysLate = diffDays;
        }
    }

    next();
});


// for the method to mark payment as verified
paymentSchema.methods.markAsVerified = function(verifiedBy, notes) {
    this.verification.isVerified = true;
    this.verification.verifiedBy = verifiedBy;
    this.verification.verifiedAt = new Date();
    this.verification.verificationNotes = notes;
    this.status = "completed";
    return this.save();
};

// Indexes for notification queries
paymentSchema.index({
    loanId: 1, paymentDate: -1
});
paymentSchema.index({
    payerId: 1, status: 1
});
paymentSchema.index({
    receiverId: 1, paymentDate: -1
});
paymentSchema.index({
    installmentId: 1
});
paymentSchema.index({
    status: 1, paymentDate: -1
});
paymentSchema.index({
    transactionId: 1
});
paymentSchema.index({
    "receipt.receiptNumber": 1
});


const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
