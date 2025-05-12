import {User} from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';

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

export const login= async (req,res)=>{
    res.send('login');
}

export const logout= async (req,res)=>{
    res.send('logout');
}
