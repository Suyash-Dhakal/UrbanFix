import {Issue} from '../models/issue.model.js';
import { User } from '../models/user.model.js';
import {getDateRange} from '../utils/dateUtils.js';


export const confirmReport=async (req,res)=>{
    const { title, category, description, ward, location, image } = req.body;
    try {
      
      
        const userId = req.userId; // Get userId from the request object
        if(!title || !category || !description || !ward || !location){
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

export const getPendingIssues= async (req,res)=>{
   try {
    const ward=req.ward;
    const pendingIssues= await Issue.find({ward, status:'pending'});
    if(!pendingIssues || pendingIssues.length === 0){
        return res.status(404).json({success:false ,message: 'No pending issues found'});
    }
    res.status(200).json({
        success: true,
        issues: pendingIssues,
    });
   } catch (error) {
        return res.status(400).json({success:false ,message: error.message });
   } 
}

export const getVerifiedIssues= async (req,res)=>{
    try {
    const ward=req.ward;
    const verifiedIssues= await Issue.find({ward, status:'verified'});
    
    if(!verifiedIssues || verifiedIssues.length === 0){
        return res.status(404).json({success:false ,message: 'No verified issues found'});
    }
    res.status(200).json({
        success: true,
        issues: verifiedIssues,
    });
   } catch (error) {
        return res.status(400).json({success:false ,message: error.message });
   }
}

export const getWardUsers= async (req,res)=>{
  try {
    const wardUsers= await User.find({wardNumber: req.ward, role: 'user'});
    
    
    if(!wardUsers || wardUsers.length === 0){
      return res.status(404).json({success:false ,message: 'No users found in this ward'});
    }

    //prepare individual user data
    const usersData= wardUsers.map(async(user)=>{ //usersData is an array of promises
      const totalReports= await Issue.countDocuments({user: user._id});
      const verifiedReports= await Issue.countDocuments({user: user._id, status: 'verified'});
      const resolvedReports= await Issue.countDocuments({user: user._id, status: 'resolved'});
      return {
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        totalReports,
        verifiedReports,
        resolvedReports,
      };
    });

    // Wait for all promises to resolve
    const resolvedUsersData = await Promise.all(usersData);

    //get ward totals
    const userIds= wardUsers.map((u)=>u._id);
    const totalUsers= usersData.length;
    const totalReports= await Issue.countDocuments({user: {$in: userIds}});
    const totalVerifiedReports= await Issue.countDocuments({user: {$in: userIds}, status: 'verified'});
    const totalResolvedReports= await Issue.countDocuments({user: {$in: userIds}, status: 'resolved'});

    return res.status(200).json({
      success: true,
      users: resolvedUsersData,
      totalUsers,
      totalReports,
      totalVerifiedReports,
      totalResolvedReports
    });
  } catch (error) {
    return res.status(400).json({success:false ,message: error.message });
  }
}

export const getTopReporters= async (req,res)=>{
    try {
            const topContributors = await Issue.aggregate([
            {$match: {status:{ $in: ['verified', 'resolved'] }}},
            {$group: {_id:'$reportedBy', verifiedCount: {$sum: 1}}},
            {$sort: {verifiedCount: -1}},
            {$limit: 3},
            {
                $lookup:{
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {$unwind: '$userInfo'},
            {
                $project:{
                    _id: 0,
                    userId: '$userInfo._id',
                    name: '$userInfo.name',
                    email: '$userInfo.email',
                    verifiedCount: 1,
                    ward: '$userInfo.wardNumber',
                }
            }
           ]);
           if(!topContributors || topContributors.length === 0){
            return res.status(404).json({success:false ,message: 'No Top Contributors found'});
          }
              res.status(200).json({
                success: true,
                topContributors,})
            
    } catch (error) {
        return res.status(400).json({success:false ,message: error.message });
    }
}

export const getTopWards= async (req,res)=>{
    try {
     const topWards = await Issue.aggregate([
      {
        $group: {
          _id: "$ward",
          totalIssues: { $sum: 1 },
          resolvedIssues: {
            $sum: {
              $cond: [{ $eq: ["$status", "resolved"] }, 1, 0]
            }
          },
          totalResolutionTime: {
            $sum: {
              $cond: [
                { $eq: ["$status", "resolved"] },
                { $subtract: ["$updatedAt", "$createdAt"] },
                0
              ]
            }
          }
        }
      },
      {
        $addFields: {
          resolutionRate: {
            $cond: [
              { $gt: ["$totalIssues", 0] },
              { $divide: ["$resolvedIssues", "$totalIssues"] },
              0
            ]
          },
          avgResolutionTime: {
            $cond: [
              { $gt: ["$resolvedIssues", 0] },
              { $divide: ["$totalResolutionTime", "$resolvedIssues"] },
              null
            ]
          }
        }
      },
      {
        $sort: {
          resolutionRate: -1,
          resolvedIssues: -1,
          avgResolutionTime: 1
        }
      },
      {
        $limit: 3
      },
      {
        $project: {
          _id: 0,
          ward: "$_id",
          totalIssues: 1,
          resolvedIssues: 1,
          resolutionRate: 1,
          avgResolutionTime: 1
        }
      }
    ]);

    res.status(200).json(topWards);   
    } catch (error) {
        return res.status(400).json({success:false ,message: error.message });
    }
}

export const getAllVerifiedIssues= async (req,res)=>{
  try {
    const allVerifiedIssues= await Issue.find({status:'verified'});
    if(!allVerifiedIssues || allVerifiedIssues.length === 0){
      return res.status(404).json({success:false ,message: 'No verified issues found'});
    }
    res.status(200).json({
      success: true,
      issues: allVerifiedIssues,
    });
  } catch (error) {
    return res.status(400).json({success:false ,message: error.message });
  }
}

export const getAnalyticsByRange= async (req,res)=>{
  try {
    const {range}=req.query;
    const adminWard=req.ward;
    const {from, to}= getDateRange(range);
    const [
    issuesOverTimeAgg,
    issuesByWard,
    issuesByCategory,
    issuesByStatus
    ]= await Promise.all([
      // Issues over time (verified + resolved counts per day)
 Issue.aggregate([
  {
    $match:{
      ward: adminWard,
      status: {$in:['verified', 'resolved']},
      createdAt: {$gte:from, $lte:to}
    }
  },
  {
    $group:{
      _id:{
        date: {$dateToString: {format: '%Y-%m-%d', date: '$createdAt'}},
        status: '$status'
      },
      count: {$sum: 1}
    }
  },
  {
    $group: {
      _id: '$_id.date',
      counts:{
        $push:{
          status: '$_id.status',
          count: '$count'
        }
      }
    }
  },
  {
    $sort: {'_id': 1}
  }
]),

// Issues By Ward (total verified issues of all wards)
Issue.aggregate([
  {
    $match: {status: 'verified', createdAt: {$gte:from, $lte:to}}
  },
  {
    $group: {
      _id:'$ward',
      count: {$sum: 1}
    }
  }
]),

// Issues By Category (verified issues in admin's ward)
Issue.aggregate([
  {
    $match:{
      ward: adminWard,
      status: 'verified',
      createdAt: {$gte:from, $lte:to}
    }
  },
  {
    $group:{
      _id:'$category',   // fixed here
      count: {$sum: 1}
    }
  }
]),

// Issues By Status (all issues in admin's ward)
Issue.aggregate([
  {
    $match:{
      ward:adminWard,
      createdAt: {$gte:from, $lte:to}
    }
  },
  {
    $group:{
      _id:'$status',
      count: {$sum: 1}
    }
  }
])]);

    // Transform Issues Over Time to structured daily counts
    const issuesOverTime = issuesOverTimeAgg.map(day => {
      const countsObj = { date: day._id, verified: 0, resolved: 0 };
      day.counts.forEach(c => {
        if (c.status === 'verified') countsObj.verified = c.count;
        if (c.status === 'resolved') countsObj.resolved = c.count;
      });
      return countsObj;
    });

    res.status(200).json({
      issuesOverTime,
      issuesByWard,
      issuesByCategory,
      issuesByStatus
    });

  } catch (error) {
    return res.status(400).json({success:false ,message: error.message });
  }
}