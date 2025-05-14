import {User} from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../mailtrap/emails.js';

export const signup= async (req,res)=>{
    const { name, email, password, address, phoneNumber, wardNumber } = req.body;
    try {
        if (!name || !email || !password || !address || !phoneNumber || !wardNumber) {
            throw new Error('All fields are required');
        }

        // Check if user already exists
        const userAlreadyExists = await User.findOne({ email });
        if(userAlreadyExists) {
            return res.status(400).json({success:false ,message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a random 6-digit verification token, toString() to convert to string
        // so that preceding zeros are not lost
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const user = new User({
            name,
            email,
            password: hashedPassword,
            address,
            phone: phoneNumber,
            wardNumber,
            verificationToken: verificationToken,
            verificationTokenExpiresAt: Date.now()+ 24*60*60*1000, // 24 hours
        });

        await user.save();

        // jwt token
        generateTokenAndSetCookie(res, user._id);

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                ...user._doc,
                password: undefined, // Exclude password from response
            },
        });

    } catch (error) {
        return res.status(400).json({success:false ,message: error.message });
    }
}

export const verifyEmail=async (req,res)=>{
    const {code}=req.body; //verification code given as input by user
    try {
        const user=await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }, // Check if token is not expired
        });

        if(!user){
            return res.status(400).json({success:false ,message: 'Invalid or expired verification code' });
        }

        user.isVerified = true;
        user.verificationToken = undefined; // Clear the verification token
        user.verificationTokenExpiresAt = undefined; // Clear the expiration time
        await user.save();

        await sendWelcomeEmail(user.name, user.email); // Send welcome email
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            user:{
                ...user._doc,
                password: undefined, // Exclude password from response
            }
        });

    } catch (error) {
        return res.status(400).json({success:false ,message: error.message });
    }

}

export const login= async (req,res)=>{
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new Error('All fields are required');
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({success:false ,message: 'Invalid credentials' });
        }

        // Check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({success:false ,message: 'Invalid credentials' });
        }

        // Check if user is verified
        // if (!user.isVerified) {
        //     return res.status(400).json({success:false ,message: 'Please verify your email first' });
        // }

        // jwt token
        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = Date.now();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            user: {
                ...user._doc,
                password: undefined, // Exclude password from response
            },
        });
    } catch (error) {
        return res.status(400).json({success:false ,message: error.message });
    }
}

export const logout= async (req,res)=>{
    res.clearCookie('token');
    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
}
