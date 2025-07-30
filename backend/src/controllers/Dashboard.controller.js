import Loan from "../models/Loan.model.js";
import Installment from "../models/Installment.model.js";
import Payment from "../models/Payment.model.js";
import Notification from "../models/Notification.model.js";
import Reminder from "../models/Reminder.model.js";

export const getLenderDashboard = async (req, res) => {
    try {
        const lenderId = req.user._id;

        // for the get all loans where user is lender
        const loans = await Loan.find({ lenderId: lenderId })
            .populate("borrowerId", "firstName lastName email profilePic")
            .sort({ createdAt: -1 });

        const loanIds = loans.map(loan => loan._id);

        const payments = await Payment.find({
            receivedId: lenderId,
            loanId: { $in: loanIds }
        }).populate("loanId", "loanAmount")
          .populate("payerId", "firstName lastName")
          .sort({ createdAt: -1 })
          .limit(10);

        const installments = await Installment.find({ loanId: { $in: loanIds }});

        const totalLoansGiven = loans.length;
        const activeLoans = loans.filter(loan => loan.status === "active").length;
        const completedLoans = loans.filter(loan => loan.status === "completed").length;
        const defaultedLoans = loans.filter(loan => loan.status === "defaulted").length;

        const totalAmountLent = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
        const totalAmountReceived = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const outstandingAmount = totalAmountLent - totalAmountReceived;

        const overdueInstallments = installments.filter(inst => inst.status === "overdue");
        const upcomingInstallments = installments.filter(inst => {
            const duedate = new Date(inst.dueDate);
            const today = new Date();
            const diffTime = duedate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7 && diffDays >= 0 && inst.status === "pending";
        });

        const notifications = await Notification.find({ userId: borrowerId })
            .sort({ createdAt: -1 })
            .limit(5);

        const reminders = await Reminder.find({
            userId: borrowerId,
            status: { $in: ["scheduled", "sent"]},
            isActive: true,
        })
        .sort({ scheduledDate: 1 })
        .limit(5);

        res.status(200).json({
            userRole: "client",
            summary: {
                totalLoansGiven,
                activeLoans,
                completedLoans,
                defaultedLoans,
                totalAmountLent,
                totalAmountReceived,
                outstandingAmount,
                overdueCount: overdueInstallments.length,
                upcomingCount: upcomingInstallments.length,
            },
            loans: loans,
            recentPayments: payments,
            overdueInstallments: overdueInstallments.slice(0, 5),
            upcomingInstallments: upcomingInstallments.slice(0, 5),
            notifications: notifications,
        });
    } catch (error) {
        console.log("Error in get client dashboard", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const getClientDashboard = async (req, res) => {
    try {
        const borrowerId = req.user._id;

        const loans = await Loan.find({ borrowerId: borrowerId })
            .populate("lenderId", "firstName lastName email profilePic")
            .populate({ createdAt: -1 });

        const loanIds = loans.map(loan => loan._id);

        const payments = await Payment.find({
            payerId: borrowerId,
            loanId: { $in: loanIds }
        })
        .populate("loanId", "loanAmount")
        .popolate("receiverId", "firstName lastName")
        .sort({ paymentDate: -1 })
        .limit(10);

        const installments = await Installment.find({ loanId: { $in: loanIds }});

        const totalLoansTaken = loans.length;
        const activeLoans = loans.filter(loan => loan.status === "active").length;
        const completedLoans = loans.filter(loan => loan.status === "completed").length;

        const totalAmountBorrowed = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
        const totalAmountPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = totalAmountBorrowed - totalAmountPaid;

        const overdueInstallments = installments.filter(inst => inst.status === "overdue");
        const upcomingInstallments = installments.filter(inst => {
            const dueDate = new Date(inst.dueDate);
            const today = new Date();
            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 7 && diffDays >= 0 && inst.status === "pending";
        });

        const totalPenalty = installments.reduce((sum, inst) => sum + (inst.penaltyAmount || 0), 0);

        const notifications = await Notification.find({ userId: borrowerId })
            .sort({ createdAt: -1 })
            .limit(5);

        const reminder = await Reminder.find({
            userId: borrowerId,
            status: { $in: ["scheduled", "sent"]},
            isActive: true,
        })
        .sort({ scheduledDate: 1 })
        .limit(5);

        res.status(200).json({
            userRole: "client",
            summary: {
                totalLoansTaken,
                activeLoans,
                completedLoans,
                totalAmountBorrowed,
                totalAmountPaid,
                remainingAmount,
                totalPenalty,
                overdueCount: overdueInstallments.length,
                upcomingCount: upcomingInstallments.length,
            },
            loans: loans,
            recentPayments: payments,
            overdueInstallments: overdueInstallments.slice(0, 5),
            upcomingInstallments: upcomingInstallments.slice(0, 5),
            notifications: notifications,
            reminders: reminders,
        });
    } catch (error) {
        console.log("Error in get client dashboard.", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const getOverallStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        let query = {};
        if(userRole === "lender") {
            query.lenderId = userId;
        }
        else {
            query.borrowerId = userId;
        }

        const monthlyStats = await Loan.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    totalLoans: { $sum: 1 },
                    totalAmount: { $sum: "$loanAmount" },
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 }}
        ]);

        let paymentQuery = {};
        if(userRole === "lender") {
            paymentQuery.receiverId = userId;
        }
        else {
            paymentQuery.payerId = userId;
        }

        const paymentTrends = await Payment.aggregate([
            { $match: paymentQuery },
            {
                $group: {
                    _id: {
                        year: { $year: "$paymentDate" },
                        month: { $month: "$paymentDate" },
                    },
                    totalPayments: { $sum: 1 },
                    totalAmount: { $sum: "$amount" },
                }
            },
        ]);

        res.status(200).json({
            monthlyLoanStats: monthlyStats,
            paymentTrends: paymentTrends,
            userRole: userRole,
        });
    } catch (error) {
        console.log("Error in get overall stats.", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const getQuickActions = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        let actions = [];

        if(userRole === "lender") {
            const pendingLoans = await Loan.countDocuments({
                lenderId: userId,
                status: "pending",
            });

            const overduePayment = await Installment.countDocuments({
                loanId: { $in: await Loan.find({ lenderId: userId }).distinct("_id")},
                status: "overdue",
            });

            actions = [
                {
                    title: "Create new loan",
                    description: "set up new loan agreement",
                    action: "create_loan",
                    count: null,
                    priority: "medium"
                },
                {
                    title: "Pending approvals",
                    description: "loans waiting for your approval",
                    action: "view_pending_loans",
                    count: pendingLoans,
                    priority: pendingLoans > 0 ? "high" : "low",
                },
                {
                    title: "Overdue payments",
                    description: "Payments that are past due date",
                    action: "view_overdue",
                    count: overduePayment,
                    priority: overduePayment > 0 ? "urgent" : "low",
                }
            ];
        }
        else {

            // yeh action client and borrower ke liye hai
            const upcomingPayment = await Installment.countDocuments({
                loanId: { $in: await Loan.find({ borrowerId: userId }).distinct("_id")},
                status: "pending",
                dueDate: {
                    $gte: new Date(),
                    $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                },
            });

            const overduePayments = await Installment.countDocuments({
                loanId: { $in: await Loan.find({ borrowerId: userId }).distinct("_id")},
                status: "overdue"
            });

            actions = [
                {
                    title: "Make payment",
                    description: "Pay your loan installments",
                    action: "make_payment",
                    count: null,
                    priority: "medium"
                },
                {
                    title: "Upcoming payments",
                    description: "Payments due in next 7 days",
                    action: "view_upcoming",
                    count: upcomingPayment,
                    priority: upcomingPayment > 0 ? "high" : "low",
                },
                {
                    title: "Overdue payments",
                    description: "payments that are past due date",
                    action: "view_overdue",
                    count: overduePayments,
                    priority: overduePayments > 0 ? "urgent" : "low"
                },
                {
                    title: "Ai assistant",
                    description: "get help with payment planning",
                    action: "open_ai_chat",
                    count: null,
                    priority: "low"
                }
            ];
        }

        res.status(200).json({
            userRole: userRole,
            quickActions: actions,
        });
    } catch (error) {
        console.log("Error in get quick actions.", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getrecentActivity = async (req, res) => {
    const { limit = 10 } = req.query;

    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        let activities = [];

        let paymentQuery = {};
        if( userRole === "lender") {
            paymentQuery.receivedId = userId;
        }
        else {
            paymentQuery.payerId = userId;
        }

        const payments = await Payment.find(paymentQuery)
            .populate("loanId", "loanAmount")
            .populate(userRole === "lender" ? "payerId" : "receivedId", "firstName lastName")
            .sort({ createdAt: -1 })
            .limit(5);

        payments.forEach(payment => {
            activities.push({
                type: "payment",
                title: userRole === "lender" ? "payment received" : "payment made",
                description: payment.createdAt,
                amount: payment.amount,
                status: payment.status,
            });
        });

        let loanQuery = {};
        if(userRole === "lender") {
            loanQuery.lenderId = userId;
        }
        else {
            loanQuery.borrowerId = userId;
        }

        const loans = await Loan.find(loanQuery)
            .populate(userRole === "lender" ? "borrowerId": "lenderId", "firstName lastName")
            .populate({ createdAt: -1 })
            .limit(3);
            
        loans.forEach(loan => {
            activities.push({
                type: "loan",
                title: userRole === "lender" ? "loan created" : "loan received",
                description: `₹${loan.loanAmount} loan ${userRole === "lender" ? "given to" : "received from"} ${loan[userRole === "lender" ? "borrowerId" : "lenderId"].firstName}`,
                date: loan.createdAt,
                amount: loan.loanAmount,
                status: loan.status,
            });
        });

        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            activities: activities.slice(0, limit),
            userRole: userRole,
        });
    } catch (error) {
        console.log("Error in get recent activity.", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};