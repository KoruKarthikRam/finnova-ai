const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: [0, "Target amount cannot be negative"],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, "Current savings amount cannot be negative"],
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "failed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Add compound index for active goal queries
goalSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Goal", goalSchema);
