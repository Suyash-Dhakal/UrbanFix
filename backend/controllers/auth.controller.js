import {User} from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail, sendResetSuccessEmail } from '../mailtrap/emails.js';

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

export const forgotPassword=async (req,res)=>{
    const {email}=req.body;
    try {
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false ,message: 'User not found' });
        }
        // Generate reset password token
        const resetToken= crypto.randomBytes(20).toString('hex');
        const resetTokenExpiresAt= Date.now() + 60*60*1000; // 1 hour

        user.resetPasswordToken=resetToken;
        user.resetPasswordExpiresAt=resetTokenExpiresAt;
        await user.save();

        // Send reset password email
        await sendResetPasswordEmail(user.email,`${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({
            success: true,
            message: 'Reset password email sent successfully',
        });

    } catch (error) {
        return res.status(400).json({success:false ,message: error.message });   
    }
}

export const resetPassword=async (req,res)=>{
    try {
    const {token}=req.params;
    const {password}=req.body;

    const user=await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpiresAt: { $gt: Date.now() }, // Check if token is not expired
    });
    if(!user){
        return res.status(400).json({success:false ,message: 'Invalid or expired reset password token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password=hashedPassword;
    user.resetPasswordToken=undefined; // Clear the reset token
    user.resetPasswordExpiresAt=undefined; // Clear the expiration time
    await user.save();

    sendResetSuccessEmail(user.email); // Send success email

    res.status(200).json({
        success: true,
        message: 'Password reset successfully',
    });

    } catch (error) {
        return res.status(400).json({success:false ,message: error.message });
    }
}

export const checkAuth=async (req,res)=>{
    try {
        const user=await User.findById(req.userId);
        
        if(!user){
            return res.status(400).json({success:false, message:'User not found'});
        }

        res.status(200).json({
            success: true,
            user: {
                ...user._doc,
                password: undefined, // Exclude password from response
            },
        })
    } catch (error) {
        return res.status(400).json({success:false ,message: error.message });
    }
}