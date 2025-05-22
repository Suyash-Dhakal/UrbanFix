import {Issue} from '../models/issue.model.js';


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

export const getUserReportedIssues=async (req,res)=>{
    try {
        const issues = await Issue.find({reportedBy:req.userId});
        if(!issues || issues.length === 0){
            return res.status(404).json({success:false ,message: 'No issues found for this user'});
        }
        res.status(200).json({
            success: true,
            issues,
        });
    } catch (error) {
        return res.status(400).json({success:false ,message: error.message });
    }
}

export const getUserStats=async (req,res)=>{
    try {
    const userId = req.userId;

    const [total, pending, verified, resolved, cancelled] = await Promise.all([
      Issue.countDocuments({ reportedBy: userId }),
      Issue.countDocuments({ reportedBy: userId, status: 'pending' }),
      Issue.countDocuments({ reportedBy: userId, status: 'verified' }),
      Issue.countDocuments({ reportedBy: userId, status: 'resolved' }),
      Issue.countDocuments({ reportedBy: userId, status: 'cancelled' }),
    ]);

        res.status(200).json({
            success: true,
            stats: {
                numberOfTotalIssues: total,
                numberOfPendingIssues: pending,
                numberOfVerifiedIssues: verified,
                numberOfResolvedIssues: resolved,
                numberOfCancelledIssues: cancelled
            }
        });
    } catch (error) {
        return res.status(400).json({success:false ,message: error.message });
    }
}

export const getWardStats= async (req,res)=>{
    try {
        const ward=req.ward;
        const [total, pending, verified, resolved, cancelled] = await Promise.all([
            Issue.countDocuments({ ward }),
            Issue.countDocuments({ ward, status: 'pending' }),
            Issue.countDocuments({ ward, status: 'verified' }),
            Issue.countDocuments({ ward, status: 'resolved' }),
            Issue.countDocuments({ ward, status: 'cancelled' }),
        ]);
        res.status(200).json({
            success: true,
            stats: {
                numberOfTotalIssues: total,
                numberOfPendingIssues: pending,
                numberOfVerifiedIssues: verified,
                numberOfResolvedIssues: resolved,
                numberOfCancelledIssues: cancelled
            }
        });
    } catch (error) {
        return res.status(400).json({success:false ,message: error.message });
    }
}