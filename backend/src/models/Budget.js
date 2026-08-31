const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    limit: {
      type: Number,
      required: true,
      min: [0, "Limit cannot be negative"],
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate budgets for the same category in the same month/year per user
budgetSchema.index(
  { userId: 1, category: 1, month: 1, year: 1 },
  { unique: true }
);

budgetSchema.index({ userId: 1, month: 1, year: 1 });

module.exports = mongoose.model("Budget", budgetSchema);
