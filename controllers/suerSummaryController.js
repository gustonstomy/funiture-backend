import UserSummary from "../models/userSummary.js";
import User from "../models/User.js";

// Get user summary with real-time calculations
export const getUserSummary = async (req, res) => {
  try {
    // Calculate real-time user statistics
    const totalUsers = await User.countDocuments();
    const totalActiveUsers = await User.countDocuments({ isActive: true });
    const totalInactiveUsers = await User.countDocuments({ isActive: false });

    // For deleted users, we'll assume they are soft-deleted or marked with a specific field
    // Since there's no explicit 'deleted' field, we'll use inactive users as placeholder
    // You might want to add a 'isDeleted' field to User model for proper tracking
    const totalDeletedUsers = 0; // Placeholder - implement based on your deletion strategy

    const summary = {
      total_users: totalUsers,
      total_active_users: totalActiveUsers,
      total_inactive_users: totalInactiveUsers,
      total_deleted_users: totalDeletedUsers,
      last_updated: new Date(),
    };

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching user summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user summary",
      error: error.message,
    });
  }
};

// Get detailed user lists by status (admin only)
export const getUsersByStatus = async (req, res) => {
  try {
    const { status } = req.params; // 'active', 'inactive', 'all'
    const { page = 1, limit = 10 } = req.query;

    let filter = {};
    switch (status) {
      case "active":
        filter = { isActive: true };
        break;
      case "inactive":
        filter = { isActive: false };
        break;
      case "all":
        // No filter - get all users
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid status. Use: active, inactive, or all",
        });
    }

    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .select(
        "-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_users: total,
          per_page: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users by status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Get user activity analytics
export const getUserAnalytics = async (req, res) => {
  try {
    // Get users created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get users who logged in recently (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsersLast7Days = await User.countDocuments({
      lastLogin: { $gte: sevenDaysAgo },
    });

    // Get users by role
    const adminCount = await User.countDocuments({ role: "admin" });
    const regularUserCount = await User.countDocuments({ role: "user" });

    // Get verified vs unverified users
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const unverifiedUsers = await User.countDocuments({
      isEmailVerified: false,
    });

    const analytics = {
      new_users_last_30_days: newUsersLast30Days,
      active_users_last_7_days: activeUsersLast7Days,
      users_by_role: {
        admins: adminCount,
        regular_users: regularUserCount,
      },
      verification_status: {
        verified: verifiedUsers,
        unverified: unverifiedUsers,
      },
      total_users: await User.countDocuments(),
      generated_at: new Date(),
    };

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user analytics",
      error: error.message,
    });
  }
};
