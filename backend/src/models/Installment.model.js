import mongoose from "mongoose";

const installmentSchema = new mongoose.Schema({
    loanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loan",
        required: true,
    },
    installmentNumber: {
        type: Number,
        required: true,
    },
    principalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    interestAmount: {
        type: Number,
        required: true,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: [
            "pending",
            "paid",
            "overdue",
            "partiallly_paid",
        ],
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    remainingAmount: {
        type: Number,
        default: function() {
            return this.totalAmount;
        },
        min: 0,
    },
    paidDate: {
        type: Date,
    },
    penaltyAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    penaltyAppliedDate: {
        type: Date,
    },
    daysOverdue: {
        type: Number,
        default: 0,
        min: 0,
    },
    paymentHistory: [{
        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
        },
        amount: Number,
        paymentDate: Date,
        paymentMethod: String,
    }],
    notes: {
        type: String,
        trim: true,
    },
    remainderSent: {
        type: Number,
        default: 0,
    },
    lastRemainderDate: {
        type: Date,
    },
}, {
    timestamps: true,
});

installmentSchema.pre("save", function(next) {
    this.remainingAmount = this.totalAmount - this.paidAmount;

    if (this.paidAmount === 0) {
        this.status = new Date() > this.dueDate ? "overdue" : "pending";
    } else if (this.paidAmount >= this.totalAmount) {
        this.status = "paid";
        this.paidDate = this.paidDate || new Date();
    } else {
        this.status = "partially_paid";
    }

    if (new Date() > this.dueDate && this.status !== "paid") {
        this.daysOverdue = Math.floor
        (( new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
    }

    next();
});

installmentSchema.index({
    loanId: 1, installmentNumber: 1
});
installmentSchema.index({
    dueDate: 1, status: 1
});
installmentSchema.index({
    status: 1, dueDate: 1
});
installmentSchema.index({
    loanId: 1, status: 1
});

const Installment = mongoose.model("Installment", installmentSchema);

export default Installment;
