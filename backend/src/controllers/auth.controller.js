import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";


export const signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        if(!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }
        if(password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 5 characters."
            });
        }

        const user = await User.findOne({ email });

        if(user) {
            return res.status(400).json({
                message: "Email already exists."
            });
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role || "client",
            phoneNumber,
        });

        if(newUser) {
            generateToken(newUser._id, res);
            await newUser.save();

            newUser.lastLogin = new Date(); // for the update of last login
            await newUser.save();

            return res.status(201).json({
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                role: newUser.role,
                phoneNumber: newUser.phoneNumber,
                isVerified: newUser.isVerified,
            }); 
        }

        res.status(400).json({ message: "Invalid user data."});
    } catch (error) {
        console.log("Error in signup controller.", error.message);
        res.status(500).json("Internal server error");
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if(!email || !password) {
            return res.status(400).json({ message: "email and password are required." });
        }
        
        let user = await User.findOne({ email });

        if(!user) {
            res.status(400).json({ message: "Invalid Credentials."});
        }

        if(!user.isActive) {
            return res.status(400).json({ message: "account is deactivated."});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect) {
            res.status(400).json({ message: "Invalid Credentials."});
        }

        user.lastLogin = new Date(); // for the update last login
        await user.save();

        generateToken(user._id, res);

        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePic: user.profilePic,
            role: user.role,
            phoneNumber: user.phoneNumber,
            profilePic: user.profilePic,
            isVerified: user.isVerified,
            lastLogin: user.lastLogin,
        });
    } catch (error) {
        console.log("Error in login controller.", error.message);
        res.status(500).json("Internal server error.");
    }
};

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({ message: "Logout successfully."});
    } catch (error) {
        console.log("Error in logout.", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -refreshToken"); // - sign indicate the do not include in final response

        if(!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json(user);
    } catch (error) {
        console.log("Error in get profile.", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const updateProfile = async (req, res) => {
    const { firstName, lastName, phoneNumber, profilePic } = req.body;

    try {
        const user = await User.findById(req.user._id);

        if(!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if(firstName) user.firstName = firstName;
        if(lastName) user.lastName = lastName;
        if(phoneNumber) user.phoneNumber = phoneNumber;
        if(profilePic) user.profilePic = profilePic;

        await user.save();

        res.status(200).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            profilePic: user.profilePic,
            isVerified: user.isVerified,
        });
    } catch (error) {
        console.log("Error in update profile.", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};
