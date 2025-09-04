import mongoose from "mongoose";

const userSummarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  total_users: {
    type: Number,
    default: 0,
  },
  total_active_users: {
    type: Number,
    default: 0,
  },
  total_inactive_users: {
    type: Number,
    default: 0,
  },
  total_deleted_users: {
    type: Number,
    default: 0,
  },
});

const UserSummary = mongoose.model("UserSummary", userSummarySchema);

export default UserSummary;
