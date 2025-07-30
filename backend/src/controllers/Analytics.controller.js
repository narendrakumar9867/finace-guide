import Analytics from "../models/Analytics.model.js";
import Loan from "../models/Loan.model.js";
import Payment from "../models/Payment.model.js";
import Installment from "../models/Installment.model.js";
import User from "../models/user.model.js";

export const trackEvent = async (req, res) => {
    const { loanId, eventType, eventDate, userAgent, ipAddress, sessionId } = req.body;

    try {
        if(!eventType) {
            return res.status(400).json({ message: "event type is required." });
        }

        const analyticsEntry = new Analytics({
            userId: req.user._id,
            loanId: loanId,
            eventType: eventType,
            eventDate: eventDate || {},
            userAgent: userAgent,
            ipAddress: ipAddress,
            sessionId: sessionId,
        });

        await analyticsEntry.save();

        res.status(201).json({
            _id: analyticsEntry._id,
            eventType: analyticsEntry.eventType,
            createdAt: analyticsEntry.createdAt,
        });
    } catch (error) {
        console.log("Error in track event.", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const getUserAnalytics = async (req, res) => {
    const { startDate, endDate, eventType } = req.query;

    try {
        let query = { userId: req.user._id };

        if(startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        if(eventType) {
            query.eventType = eventType;
        }

        const analytics = await Analytics.find(query)
            .populate("loanId", "loanAmount status")
            .sort({ createdAt: -1 })
            .limit(100);

        const eventSummary = await Analytics.aggregate([
            { $match: query },
            { $group: {
                _id: "$eventType",
                count: { $sum: 1 }
            }}
        ]);

        res.status(200).json({
            events: analytics,
            summary: eventSummary,
            totalEvents: analytics.length,
        });
    } catch (error) {
        console.log("Error in get user analytics.", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const getLoanAnalytics = async (req, res) => {
    const { loanId } = req.params;

    try {
        const loan = await Loan.findById(loanId);

        if(!loan) {
            return res.status(404).json({ message: "Loan not found" });
        }

        const userId = req.user._id.toString();
        if(loan.borrowerId.toString() !== userId && loan.lenderId.toString() !== userId) {
            return res.status(403).json({ message: "unauthorized access." });
        }

        const analytics = await Analytics.find({ loanId: loanId })
            .sort({ createdAt: -1 });

        const payments = await Payment.find({ loanId: loanId })
            .sort({ paymentDate: -1 });

        const installments = await Installment.find({ loanId: loanId });

        // for the calculate analytics summary 
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = loan.loanAmount - totalPaid;
        const paidInstallments = installments.filter(inst => inst.status === "paid").length;
        const overdueInstallments = installments.filter(ints => inst.status === "overdue").length;

        const paymentHistory = payments.map(payment => ({
            date: payment.paymentDate,
            amount: payment.amount,
            method: payment.paymentMethod,
        }));

        res.status(200).json({
            loanId: loanId,
            summary: {
                totalPaid: totalPaid,
                remainingAmount: remainingAmount,
                paidInstallments: paidInstallments,
                overdueInstallments: overdueInstallments,
                totalInstallments: installments.length,
            },
            paymentHistory: paymentHistory,
            events: analytics
        });
    } catch (error) {
        console.log("Error in get loan analytics.", error.message);
        res.status(500).json({ message: "Internal server error"});
    }
};

export const getDashboardAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        let loans;
        if(userRole === "lender") {
            loans = await Loan.find({ lenderId: userId });
        }
        else {
            loans = await Loan.find({ borrowerId: userId });
        }

        const loanIds = loans.map(loan => loan._id);

        // get payments for user loans ke liye
        const payments = await Payment.find({ loanId: { $in: loanIds }})
            .sort({ paymentDate: -1 });

        // get installments for user loans ke liye
        const installments = await Installment.find({ loanId: { $in: loanIds }});

        // calculate summary statistics
        const totalLoans = loans.length;
        const activeLoans = loans.filter(loan => loan.status === "active").length;
        const completedLoans = loans.filter(loan => loan.status === "completed").length;

        let totalAmount = 0;
        let totalPaid = 0;

        if(userRole === "lender") {
            totalAmount = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
            totalPaid = payments.filter(p => p.receiverId.toString() === userId.toString())
                .reduce((sum, payment) => sum + payment.amount, 0);
        }
        else {
            totalAmount = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
            totalPaid = payments.filter(p => p.payerId.toString() === userId.toString())
                .reduce((sum, payment) => sum + payment.amount, 0);
        }

        const remainingAmount = totalAmount - totalPaid;
        const overdueInstallments = installments.filter(inst => inst.status === "overdue").length;

        const monthlyPayments = await Payment.aggregate([
            { $match: { $loanId: { $in: loanIds }}},
            {
                $group: {
                    _id: {
                        year: { $year: "$paymentDate" },
                        month: { $month: "$paymentDate" },
                    },
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 },
                } 
            },
            { $sort: { "_id.year": 1, "_id.month": 1 }}
        ]);

        res.status(200).json({
            summary: {
                totalLoans,
                totalAmount,
                totalPaid,
                completedLoans,
                activeLoans,
                remainingAmount,
                overdueInstallments
            },
            monthlyTrends: monthlyPayments,
            recentPayments: payments.slice(0, 10),
            userRole: userRole
        });
    } catch (error) {
        console.log("Error in get dashboard analytics.", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};


export const getPaymentAnalytics = async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        const userId = req.user._id;
        let query = {};

        if(req.user.role === "lender") {
            query.receiverId = userId;
        }
        else {
            query.payerId = userId;
        }

        if(startDate && endDate) {
            query.paymentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const payments = await Payment.find(query)
            .populate("loanId", "loanAmount")
            .sort({ paymentDate: -1 });

        //for the group by payment method
        const paymentMethods = await Payment.aggregate([
            { $match: query },
            { $group: { _id: "$paymentMethod", total: { $sum: "$amount" }, count: { $sum: 1 }}}
        ]);

        // for th group by status
        const paymentStatus = await Payment.aggregate([
            { $match: query },
            { $group: { _id: "$status", total: { $sum: "$amount" }, count: { $sum: 1 }}}
        ]);

        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const averagePayment = payments.length > 0 ? totalAmount / payments.length : 0;

        res.status(200).json({
            payments: payments,
            summary: {
                totalPayments: payments.length,
                totalAmount: totalAmount,
                averagePayment: averagePayment
            },
            breakdown: {
                byMethod: paymentMethods,
                byStatus: paymentStatus
            }
        });
    } catch (error) {
        console.log("Error in get payment analytics.", error.message);
        res.status(500).json({ message: "Internal server error."})
    }
};

