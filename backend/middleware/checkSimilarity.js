import { Issue } from "../models/issue.model.js";
import { cosineSimilarity } from "../utils/cosineSimilarity.js";

export const checkSimilarity=async (req,res,next)=>{
    const {title, description, category, ward} = req.body;
    if(!title || !description || !category || !ward) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    //fetching existing issues from same category and ward

    try {
        const existingIssues=await Issue.find({ward, category});
    if(existingIssues.length===0){
        return next();
    }
    
    const similarIssues=[];
    for(const issue of existingIssues){
        const similarityScore=await cosineSimilarity(description, issue.description);
        
        if(similarityScore>0.75){
            similarIssues.push({
                id: issue._id,
                title: issue.title,
                description: issue.description,
                ward: issue.ward,
                image: Array.isArray(issue.image) ? issue.image : (issue.image ? [issue.image] : []),
                similarity: (similarityScore * 100).toFixed(2) + '%'
            });
        }
    }
    if(similarIssues.length>0){
        return res.status(200).json({
            success: true,
            message: 'Similar issues found.',
            similarIssues:similarIssues.slice(0,3) // return only top 3 similar issues
        });
    }
    next(); // if no similar issues found, proceed to the next middleware
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error' });   
    }
}