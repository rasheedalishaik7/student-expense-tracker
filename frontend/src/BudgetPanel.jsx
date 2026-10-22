
import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5001/api/budget";

function dateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function BudgetPanel({ expenses = [] }) {
  const [dailyLimit, setDailyLimit] = useState("500");
  const [monthlyLimit, setMonthlyLimit] = useState("10000");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadBudget() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        setDailyLimit(String(data.dailyLimit));
        setMonthlyLimit(String(data.monthlyLimit));
      } catch (error) {
        setMessage(error.message || "Unable to load budget.");
      } finally {
        setLoading(false);
      }
    }

    loadBudget();
  }, []);

  const now = new Date();
  const today = dateKey(now);
  const month = today.slice(0, 7);

  const spentToday = expenses.reduce((sum, expense) => {
    return dateKey(expense.date) === today
      ? sum + Number(expense.amount || 0)
      : sum;
  }, 0);

  const spentMonthly = expenses.reduce((sum, expense) => {
    return dateKey(expense.date).startsWith(month)
      ? sum + Number(expense.amount || 0)
      : sum;
  }, 0);

  async function saveBudget(event) {
    event.preventDefault();
    setMessage("");

    const daily = Number(dailyLimit);
    const monthly = Number(monthlyLimit);

    if (
      dailyLimit.trim() === "" ||
      monthlyLimit.trim() === "" ||
      !Number.isFinite(daily) ||
      !Number.isFinite(monthly) ||
      daily < 0 ||
      monthly < 0
    ) {
      setMessage("Enter valid limits of zero or more.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyLimit: daily,
          monthlyLimit: monthly
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setDailyLimit(String(data.budget.dailyLimit));
      setMonthlyLimit(String(data.budget.monthlyLimit));
      setMessage("Budget limits saved successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to save budget.");
    } finally {
      setSaving(false);
    }
  }

  function renderCard(title, spent, limit, period) {
    const percentage =
      limit > 0 ? (spent / limit) * 100 : spent > 0 ? 100 : 0;
    const warning = limit > 0 && percentage >= 80;
    const exceeded = limit > 0 && percentage >= 100;

    let status = `₹${Math.max(0, limit - spent).toLocaleString("en-IN")} remaining`;

    if (limit === 0) {
      status = "No limit set; spending is allowed.";
    } else if (exceeded) {
      status = `⚠️ ${period} budget reached or exceeded!`;
    } else if (warning) {
      status = `⚠️ ${Math.floor(percentage)}% of your ${period} budget used.`;
    }

    return (
      <div
        key={period}
        style={{
          flex: "1 1 240px",
          minWidth: 0,
          padding: 16,
          border: "1px solid #d1d5db",
          borderRadius: 12
        }}
      >
        <h3>{title}</h3>
        <p>Spent: ₹{spent.toLocaleString("en-IN")}</p>
        <p>Limit: ₹{limit.toLocaleString("en-IN")}</p>

        <div
          style={{
            height: 10,
            background: "#e5e7eb",
            borderRadius: 10,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(percentage, 100)}%`,
              background: warning ? "#dc2626" : "#16a34a"
            }}
          />
        </div>

        <p style={{ color: warning ? "#dc2626" : "#15803d" }}>
          {status}
        </p>
      </div>
    );
  }

  if (loading) return <p>Loading budgets...</p>;

  return (
    <section style={{ margin: "24px 0" }}>
      <h2>Daily & Monthly Budget</h2>

      <form
        onSubmit={saveBudget}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "end",
          gap: 12,
          marginBottom: 16
        }}
      >
        <label>
          Daily limit (₹)
          <br />
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={dailyLimit}
            onChange={(event) => setDailyLimit(event.target.value)}
          />
        </label>

        <label>
          Monthly limit (₹)
          <br />
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={monthlyLimit}
            onChange={(event) => setMonthlyLimit(event.target.value)}
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Limits"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {renderCard("Today's Spending", spentToday, Number(dailyLimit) || 0, "daily")}
        {renderCard("This Month", spentMonthly, Number(monthlyLimit) || 0, "monthly")}
      </div>

      <p>
        Budget warnings do not block expenses. You can continue adding
        expenses after reaching a limit.
      </p>
    </section>
  );
}

export default BudgetPanel;
