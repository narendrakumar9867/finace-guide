import ChatConversation from "../models/ChatConversation.model.js";
import ChatMessage from "../models/ChatMessage.model.js";
import Loan from "../models/Loan.model.js";
import Installment from "../models/Installment.model.js";
import Payment from "../models/Payment.model.js";

export const createConversation = async (req, res) => {
    const { loanId, title, conversationType } = req.body;

    try {
        const newConversation = new ChatConversation({
            userId: req.user._id,
            loanId: loanId || null,
            title: title || "New Conversation",
            conversationType: conversationType || "general",
        });

        await newConversation.save();

        res.status(201).json({
            _id: newConversation._id,
            title: newConversation.title,
            conversationType: newConversation.conversationType,
            loanId: newConversation.status,
            createdAt: newConversation.createdAt,
        });
    } catch (error) {
        console.log("Error in ceate conversation.", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const getConversation = async (req, res) => {
    try {
        const conversation = await ChatConversation.find({
            userId: req.user._id,
            isArchived: false,
        })
        .populate("loanId", "loanAmount borrowId lenderId status")
        .sort({ updatedAt: -1 });

        res.status(200).json(conversation);
    } catch (error) {
        console.log("Error in get conversation.", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const sendMessage = async (req, res) => {
    const { conversationId } = req.params;
    const { content, messageType } = req.body;

    try {
        if(!content || !messageType) {
            return res.status(400).json({ message: "content and message  type are required."});
        }

        const conversation = await ChatConversation.findById(conversationId);

        if(!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        if(conversation.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized access." });
        }

        const newMessage = new ChatMessage({
            conversationId: conversationId,
            userId: req.user._id,
            messageType: messageType,
            content: content,
        });

        await newMessage.save();

        conversation.metadata.totalMessages += 1; // update conversation metadata
        conversation.metadata.lastMessageAt = new Date();
        await conversation.save();

        if(messageType === "user") {
            const aiResponse = await generateAIResponse(content, conversation.loanId);

            const aiMessage = new ChatMessage({
                conversationId: conversationId,
                userId: req.user._id,
                messageType: aiResponse.content,
                aiResponse: {
                    suggestionType: aiResponse.suggestionType,
                    confidence: aiResponse.confidence,
                    tokensUsed: aiResponse.tokensUsed,
                    responseTime: aiResponse.responseTime,
                    modelUsed: aiResponse.modelUsed,
                }
            });

            await aiMessage.save();

            conversation.metadata.aiSuggestionsCount += 1;
            await conversation.save();
        }

        res.status(201).json({
            _id: newMessage._id,
            content: newMessage.content,
            messageType: newMessage.messageType,
            createdAt: newMessage.createdAt,
        });
    } catch (error) {
        console.log("Error in send message.", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const getMessage = async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    try {
        const conversation = await ChatConversation.findById(conversationId);

        if(!conversation) {
            res.status(404).json({ message: "Conversation not found." });
        }

        if(conversation.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "unauthorized access." });
        }

        const messages = await ChatMessage.find({
            conversationId: conversationId,
            "metadata.isDeleted": { $ne: true },
        })
        .sort({ createdAt: -1 })
        .limit( limit * 1 )
        .skip(( page - 1) * limit);

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in get messages.", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const getLoanSuggestions = async (req, res) => {
    const { loanId } = req.params;

    try {
        const loan = await Loan.findById(loanId)
            .populate("borrowerId", "firstName lastName")
            .populate("lenderId", "firstName lastName");

        if(!loan) {
            return res.status(404).json({ message: "loan not found." });
        }

        const userId = req.user._id.toString();
        if(loan.borrowerId._id.toString() !== userId && loan.lenderId._id.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access."});
        }

        const installments = await Installment.find({ loanId: loanId });
        const payments = await Payment.find({ loanId: loanId });

        const suggestions = await generateLoanSuggestions(loan, installments, payments, req.user.role);

        res.status(200).json({
            loanId: loanId,
            suggestions: suggestions,
            generatedAt: new Date(),
        });
    } catch (error) {
        console.log("Error in get loan suggestions.", error.message);
        res.status(500).json({ message: "Internal server error." });      
    }
};

// for help fun to generate ai response

const generateAIResponse = async (userMessage, loanId) => { 

    // this would integrate with actual ai service (openai)
    const startTime = Date.now();

    let response = {
        content: "I understand your message. let me help you with that.",
        suggestionType: "general_advice",
        confidence: 0.8,
        tokensUsed: 150,
        responseTime: Date.now() - startTime,
        modelUsed: "gpt-3.5-turbo"
    };

    // simple keyword based responses (replace with actual ai integration)
    if(userMessage.toLowerCase().includes("payment")) {
        response.content = "Based on your loan details, i recommend making payments on time to avoid penalties. would you like me to show your upcoming payment schedule?";
        response.suggestionType = "payment_plan";
    } else if(userMessage.toLowerCase().includes("penalty")) {
        response.content = "Penalties are applied when payments are late. you can avoid them by paying before the due date. let me check your current pentalty status.";
        response.suggestionType = "penalty_explanation";
    }

    return response;
};

//for helper fun to generate loan suggestions
const generateLoanSuggestions = async (loan, installments, payments, userRole) => {
    const suggestions = [];

    const overdue = installments.filter(inst => inst.status === "overdue");
    const upcoming = installments.filter(inst => {
        const dueDate = new Date(inst.dueDate);
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0 && inst.status === "pending";
    });

    if(overdue.length > 0) {
        suggestions.push({
            type: "urgent",
            title: "Overdue Payments",
            message: `You have ${overdue.length} overdue payments. consider making immediate payments to avoid additional penalties.`,
            actionable: true,
        });
    }

    if(upcoming.length > 0) {
        suggestions.push({
            type: "reminder",
            title: "Upcoming Payments",
            message: `You have ${upcoming.length} payments due within the next 7 days.`,
            actionable: true,
        });
    }

    return suggestions;
};
