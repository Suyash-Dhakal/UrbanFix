import { User } from "../models/user.model.js";

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.role !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied, you are not an admin",
        });
    }
    req.ward = user.wardNumber; // Assuming the user model has a wardNumber field
    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
