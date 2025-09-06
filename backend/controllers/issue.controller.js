import {Issue} from '../models/issue.model.js';
import { User } from '../models/user.model.js';
import {getDateRange} from '../utils/dateUtils.js';
import { createNotification } from '../utils/notification.js';


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
        // Create and send notification to the admin of respective ward
        const admin = await User.findOne({wardNumber: ward, role: 'admin'}).select('_id');
        if(!admin){
          console.warn(`No admin found for ward ${ward}. Notification not sent.`);
        }
        else{
        await createNotification({
          recipientId: admin._id,
            issueId: issue._id,
            type: 'issue_reported',
            title: `New issue of category ${category} reported`,
            message: `A new issue titled "${title}" has been reported in your ward. Please review and take necessary action.`,
            status: 'unread'
        })
      }
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
        return res.status(200).json({success:true ,message: 'No pending issues found', issues:[]});
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
        return res.status(200).json({success:true ,message: 'No verified issues found', issues:[]});
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
    $match: {
      ward: adminWard,
      status: { $in: ['verified', 'resolved'] },
      updatedAt: { $gte: from, $lte: to }
    }
  },
  {
    $group: {
      _id: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
        status: '$status'
      },
      count: { $sum: 1 }
    }
  },
  {
    $group: {
      _id: '$_id.date',
      counts: {
        $push: {
          status: '$_id.status',
          count: '$count'
        }
      }
    }
  },
  {
    $sort: { '_id': 1 }
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

    const [totalVerified, totalPending, totalResolved] = await Promise.all([
  Issue.countDocuments({ ward: adminWard, status: 'verified', createdAt: { $gte: from, $lte: to } }),
  Issue.countDocuments({ ward: adminWard, status: 'pending', createdAt: { $gte: from, $lte: to } }),
  Issue.countDocuments({ ward: adminWard, status: 'resolved', createdAt: { $gte: from, $lte: to } })
]);

const totalReported = totalVerified + totalPending;
const resolutionRate = totalReported === 0 ? 0 : ((totalResolved / totalReported) * 100).toFixed(2); 

    res.status(200).json({
      totalReported,
  totalResolved,
  totalPending,
  resolutionRate,
      issuesOverTime,
      issuesByWard,
      issuesByCategory,
      issuesByStatus
    });

  } catch (error) {
    return res.status(400).json({success:false ,message: error.message });
  }
}

export const getReports= async (req,res)=>{
  try {
    const {category, ward, status} = req.query;
    const filter= {
      status: {$in: ['verified', 'resolved']}, // Default filter
    };

    //override default filter based on query params
    if(status){
      filter.status = status; // Set specific status if provided
    }
    if(category){
      filter.category = category; // Set specific category if provided
    }
    if(ward){
      filter.ward = ward; // Set specific ward if provided
    }

    const reports= await Issue.find(filter)
    .populate('reportedBy', 'name') // Populate user details
    .select('_id title category description ward image status createdAt reportedBy') // Select only necessary fields
    .exec(); // Execute the query

    if(!reports || reports.length === 0){
      return res.status(404).json({success:false ,message: 'No reports found'});
    }
    res.status(200).json({
      success: true,
      reports,
    });

  } catch (error) {
    return res.status(400).json({success:false ,message: error.message });  
  }
}

export const getReportById= async (req,res)=>{
  const {id}= req.params;
  try {
    const report = await Issue.findById(id)
    .populate('reportedBy', 'name'); // Populate user details
    if(!report){
      return res.status(404).json({success:false ,message: 'Report not found'});
    }
    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    return res.status(400).json({success:false ,message: error.message });
  }
}

export const verifyIssue= async (req,res)=>{
  const { id } = req.body;
try {
    // Bad request: missing input
    if (!id) {
      return res.status(400).json({ success: false, message: "Issue ID is required" });
    }

    const issue = await Issue.findById(id);

    // Not found: resource doesn't exist
    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    issue.status = "verified";
    await issue.save();
        // Create and send notification to the user who reported the issue
        const user = await User.findById(issue.reportedBy).select('_id');
        const {category, title, ward}= issue;
        if(!user){
          console.warn(`No user found for issue ${id}. Notification not sent.`);
        }
        else{
        await createNotification({
          recipientId: user._id,
            issueId: issue._id,
            type: 'status_changed',
            title: `Your reported issue of category ${category} has been verified`,
            message: `The issue titled "${title}" reported in ward ${ward} has been verified by the admin.`,
            status: 'unread'
        })
      }
    return res.status(200).json({ success: true, message: "Issue verified successfully" });

  } catch (error) {
    console.error(error);
    return res
      .status(500) // unexpected error → server error
      .json({ success: false, message: "Something went wrong" });
  }
};

export const cancelIssue = async (req, res) => {
  const { id } = req.body;

  try {
    // Bad request: missing input
    if (!id) {
      return res.status(400).json({ success: false, message: "Issue ID is required" });
    }

    const issue = await Issue.findById(id);

    // Not found: resource doesn't exist
    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    issue.status = "cancelled";
    await issue.save();
        // Create and send notification to the user who reported the issue
        const user = await User.findById(issue.reportedBy).select('_id');
        const {category, title, ward}= issue;
        if(!user){
          console.warn(`No user found for issue ${id}. Notification not sent.`);
        }
        else{
        await createNotification({
          recipientId: user._id,
            issueId: issue._id,
            type: 'status_changed',
            title: `Your reported issue of category ${category} has been cancelled`,
            message: `The issue titled "${title}" reported in ward ${ward} has been cancelled by the admin.`,
            status: 'unread'
        })
      }

    return res.status(200).json({ success: true, message: "Issue cancelled successfully" });

  } catch (error) {
    console.error(error);
    return res
      .status(500) // unexpected error → server error
      .json({ success: false, message: "Something went wrong" });
  }
};

export const resolveIssue= async(req,res)=>{
  const { id } = req.body;
  try {
    // Bad request: missing input
    if (!id) {
      return res.status(400).json({ success: false, message: "Issue ID is required" });
    }

    const issue = await Issue.findById(id);

    // Not found: resource doesn't exist
    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }
    issue.status = "resolved";
    await issue.save();
        // Create and send notification to the user who reported the issue
        const user = await User.findById(issue.reportedBy).select('_id');
        const {category, title, ward}= issue;
        if(!user){
          console.warn(`No user found for issue ${id}. Notification not sent.`);
        }
        else{
        await createNotification({
          recipientId: user._id,
            issueId: issue._id,
            type: 'status_changed',
            title: `Your reported issue of category ${category} has been resolved`,
            message: `The issue titled "${title}" reported in ward ${ward} has been resolved by the admin.`,
            status: 'unread'
        })
      }

    res.status(200).json({ success: true, message: "Issue resolved successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500) // unexpected error → server error
      .json({ success: false, message: "Something went wrong" });
  }
}

export const getMyReports = async (req, res)=>{
  try {
    const userId = req.userId;
    const myReports = await Issue.find({ reportedBy: userId })
      .select('_id title category description ward image status createdAt updatedAt'); // Select only necessary fields
      
    if (!myReports || myReports.length === 0) {
      return res.status(200).json({ success: true, message: 'No reports found', reports: [] });
    }
    const pendingCount = myReports.filter(report => report.status === 'pending').length;
    const verifiedCount = myReports.filter(report => report.status === 'verified').length;
    const resolvedCount = myReports.filter(report => report.status === 'resolved').length;
    const cancelledCount = myReports.filter(report => report.status === 'cancelled').length;
    res.status(200).json({ success: true, pending: pendingCount, verified: verifiedCount, resolved: resolvedCount, cancelled: cancelledCount, reports: myReports });
  } catch (error) {
    console.error(error);
    return res
      .status(500) // unexpected error → server error
      .json({ success: false, message: "Something went wrong" });
  }
}