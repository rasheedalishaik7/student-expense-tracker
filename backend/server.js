

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Expense = require("./models/Expense");
const Budget = require("./models/Budget");

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// GET: Retrieve all expenses
app.get("/api/expenses", async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve expenses",
      error: error.message
    });
  }
});

// POST: Add a new expense
app.post("/api/expenses", async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    const expense = new Expense({
      title,
      amount: Number(amount),
      category,
      date: date || Date.now()
    });

    const savedExpense = await expense.save();

    res.status(201).json({
      message: "Expense added successfully",
      expense: savedExpense
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add expense",
      error: error.message
    });
  }
});

// PUT: Update an existing expense
app.put("/api/expenses/:id", async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        title,
        amount: Number(amount),
        category,
        date
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    res.status(200).json({
      message: "Expense updated successfully",
      expense: updatedExpense
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update expense",
      error: error.message
    });
  }
});

// DELETE: Remove an expense
app.delete("/api/expenses/:id", async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(
      req.params.id
    );

    if (!deletedExpense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    res.status(200).json({
      message: "Expense deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete expense",
      error: error.message
    });
  }
});

// GET: Retrieve budget limits
app.get("/api/budget", async (req, res) => {
  try {
    let budget = await Budget.findOne();

    if (!budget) {
      budget = await Budget.create({
        dailyLimit: 500,
        monthlyLimit: 10000
      });
    }

    res.status(200).json(budget);
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve budget",
      error: error.message
    });
  }
});

// PUT: Save budget limits
app.put("/api/budget", async (req, res) => {
  try {
    const { dailyLimit, monthlyLimit } = req.body;

    if (
      dailyLimit === undefined ||
      monthlyLimit === undefined ||
      String(dailyLimit).trim() === "" ||
      String(monthlyLimit).trim() === ""
    ) {
      return res.status(400).json({
        message: "Both budget limits are required"
      });
    }

    const daily = Number(dailyLimit);
    const monthly = Number(monthlyLimit);

    if (
      !Number.isFinite(daily) ||
      !Number.isFinite(monthly) ||
      daily < 0 ||
      monthly < 0
    ) {
      return res.status(400).json({
        message: "Budget limits must be valid non-negative numbers"
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {},
      {
        $set: {
          dailyLimit: daily,
          monthlyLimit: monthly
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({
      message: "Budget limits saved successfully",
      budget
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to save budget",
      error: error.message
    });
  }
});

// Connect to MongoDB Atlas and start server
async function startServer() {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        "MONGODB_URI is missing. Check your backend/.env file."
      );
    }

    await mongoose.connect(mongoURI);

    console.log("MongoDB Atlas connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exitCode = 1;
  }
}

startServer();
