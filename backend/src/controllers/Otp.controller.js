import dotenv from "dotenv";
import otpGenerator from "otp-generator";
import twilio from "twilio";
import OtpModel from "../models/Otp.model.js";

dotenv.config();

const accountsid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const twilioClient = new twilio(accountsid, authToken);

export const sendOtp = async (req, res) => {
    try {

        const { phoneNumber } = req.body;

        const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false});

        const cDate = new Date();

        await OtpModel.findOneAndUpdate(
            { phoneNumber },
            { otp, otpExpiration: new Date(cDate.getTime())},
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await twilioClient.messages.create({
            body: `Your OTP is: ${otp}`,
            to: phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        return res.status(200).json({
            success: true,
            msg: "OTP send successfully!"
        });
    } catch (error) {
        console.error("", error);
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};
