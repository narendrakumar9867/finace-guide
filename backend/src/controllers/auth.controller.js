import { generateToken } from "../lib/utils";
import User from "../models/user.model.js";


export const signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        if(!firstName || !LastName || !email || !password) {
            return res.status(400).json({
                message: "All fields are required."
            });
        }
        if(password.length < 5) {
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
            password: hashedPassword
        });

        if(newUser) {
            generateToken(newUser._id, res); 
        }

        await newUser.save();

        res.status(201).json({
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            profilePic: newUser.profilePic, 
        });

        res.status(400).json({ message: "Invalid user data."});
    } catch (error) {
        console.log("Error in signup controller.", error.message);
        res.status(500).json("Internal server error");
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        
        let user = await User.findOne({ email });

        if(!user) {
            res.status(400).json({ message: "Invalid Credentials."});
        }

        user = user.toObject({ getters: true });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect) {
            res.status(400).json({ message: "Invalid Credentials."});
        }

        generateToken(user._id, res);

        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller.", error.message);
        res.status(500).json("Internal server error.");
    }
};