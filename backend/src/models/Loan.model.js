import mongoose from "mongoose";

const loanSchema = new mongoose.Schema({
    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    borrowerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    loanAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    interestRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100, // percentage me
    },
    interestType: {
        type: String,
        enum: [
            "simple",
            "compound",
        ],
        default: "simple",
    },
    loanTerm: {
        type: Number,
        required: true,
        min: 1,
    },
    installmentAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    totalInstallments: {
        type: Number,
        required: true,
        min: 1,
    },
    loanStartDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    loanEndDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: [
            "pending",
            "active",
            "completed",
            "defaulted",
            "canceled",
        ],
        default: "pending",
    },
    purpose: {
        type: String,
        trim: true,
    },
    collateral: {
        description: String,
        value: Number,
        documents: [{
            fileName: String,
            fileUrl: String,
            fileType: String,
        }],
    },
    paymentSchedule: {
        type: String,
        enum: [
            "monthly",
            "weekly",
            "bi-weekly",
            "quarterly"
        ],
    },
    totalAmountPaid: {
        type: String,
        default: 0,
        min: 0
    },
    remainingBalance: {
        type: Number,
        default: function() {
            return this.loanAmount;
        },
        min: 0,
    },
    nextDueDate: {
        type: Date,
    },
    penaltyRate: {
        type: Number,
        default: 5,
        min: 0,
    },
    totalPenalty: {
        type: Number,
        default: 0,
        min: 0,
    },
    gracePeriod: {
        type: Number,
        default: 3,
        min: 0,
    },
    documents: [{
        documentType: {
            type: String,
            enum: [
                "agreement",
                "id_proof",
                "income_proof",
                "other",
            ],
        },
        fileName: String,
        fileUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    }],
    agreementTerms: {
        signedByLender: {
            type: Boolean,
            default: false,
        },
        signedByBorrower: {
            type: Boolean,
            default: false,
        },
        signedAt: Date,
        agreementHash: String,
    },
    metadata: {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        paymentCount: {
            type: Number,
            default: 0,
        },
        lastPaymentDate: Date,
        earlyPaymentAllowed: {
            type: Boolean,
            default: true,
        },
        partialPaymentAllowed: {
            type: Boolean,
            default: true,
        },
    },
    notes: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

loanSchema.pre("save", function(next) {
    if (this.isNew || this.isModified("loanStartDate") || this.isModified("loanTerm")) {
        const startDate = new Date(this.loanStartDate);
        this.loanEndDate = new Date(startDate.setMonth(startDate.getMonth() + this.loanTerm));
    }

    this.remainingBalance = this.loanAmount - this.totalAmountPaid;

    next();
});

loanSchema.index({
    lenderId: 1, status: 1
});
loanSchema.index({
    borrowerId: 1, status: 1
});
loanSchema.index({
    status: 1, loanStartDate: -1
});
loanSchema.index({
    nextDueDate: 1, status: 1
});
loanSchema.index({
    loanEndDate: 1
});

const Loan = mongoose.model("Loan", loanSchema);

export default Loan;
