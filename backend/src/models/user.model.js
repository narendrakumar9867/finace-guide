import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    profilePic: {
        type:String,
        default: "",
    },
    role: {
        type: String,
        enum: ['client', 'lender', 'admin'],
        default: 'client',
    },
    phoneNumber: {
        type: String,
        trim: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLogin: {
        type: Date,
    },
    refreshToken: {
        type: String,
    },
}, {
    timestamps: true,
});

userSchema.index({
    email: 1,
    role: 1
});

const User = mongoose.model('User', userSchema);

export default User;
