import {Issue} from '../models/issue.model.js';


export const reportIssue=async (req,res)=>{

}

export const confirmReport=async (req,res)=>{
    const { title, category, description, ward, location, image } = req.body;
    try {
        const userId = req.userId; // Get userId from the request object
        if(!title || !category || !description || !ward || !location || !image){
            throw new Error('All fields are required');
        }
        const issue = new Issue({
            title,
            category,
            description,
            ward,
            location,
            image,
            reportedBy: userId, // Use the userId from the request object
        });
        await issue.save();
        res.status(201).json({
            success: true,
            message: 'Issue reported successfully',
            issue, // Return the created issue
        });
    } catch (error) {
        return res.status(400).json({success:false ,message: error.message });
    }
}