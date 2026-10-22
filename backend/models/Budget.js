const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    dailyLimit: {
      type: Number,
      required: true,
      default: 500,
      min: 0
    },
    monthlyLimit: {
      type: Number,
      required: true,
      default: 10000,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);