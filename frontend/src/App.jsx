
import React, { useEffect, useState } from "react";
import BudgetPanel from "./BudgetPanel";

const API_URL = "https://student-expense-tracker-api-cvz8.onrender.com/api/expenses";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load expenses");
      }

      setExpenses(data);
    } catch (error) {
      setMessage(error.message || "Unable to connect to the backend");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTitle("");
    setAmount("");
    setCategory("Food");
    setDate(new Date().toLocaleDateString("en-CA"));
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!title.trim() || amount === "" || Number(amount) <= 0 || !date) {
      setMessage("Enter a title, a valid positive amount, and a date.");
      return;
    }

    const expenseData = {
      title: title.trim(),
      amount: Number(amount),
      category,
      date
    };

    const url = editingId
      ? `${API_URL}/${editingId}`
      : API_URL;

    try {
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save expense");
      }

      setMessage(
        editingId
          ? "Expense updated successfully."
          : "Expense added successfully."
      );

      resetForm();
      await fetchExpenses();
    } catch (error) {
      setMessage(error.message || "Unable to save expense");
    }
  }

  function handleEdit(expense) {
    setEditingId(expense._id);
    setTitle(expense.title || "");
    setAmount(String(expense.amount ?? ""));
    setCategory(expense.category || "Other");

    const expenseDate = expense.date
      ? new Date(expense.date)
      : new Date();

    const year = expenseDate.getFullYear();
    const month = String(expenseDate.getMonth() + 1).padStart(2, "0");
    const day = String(expenseDate.getDate()).padStart(2, "0");

    setDate(`${year}-${month}-${day}`);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete expense");
      }

      if (editingId === id) resetForm();

      setMessage("Expense deleted successfully.");
      await fetchExpenses();
    } catch (error) {
      setMessage(error.message || "Unable to delete expense");
    }
  }

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );

  return (
    <main style={styles.page}>
      <h1>Student Expense Tracker</h1>
      <p style={styles.subtitle}>
        Track your spending and manage your budget.
      </p>

      <BudgetPanel expenses={expenses} />

      <section style={styles.card}>
        <h2>{editingId ? "Edit Expense" : "Add Expense"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Expense title
            <input
              style={styles.input}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Lunch"
              required
            />
          </label>

          <label style={styles.label}>
            Amount (₹)
            <input
              style={styles.input}
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="e.g. 150"
              required
            />
          </label>

          <label style={styles.label}>
            Category
            <select
              style={styles.input}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>Food</option>
              <option>Transport</option>
              <option>Education</option>
              <option>Entertainment</option>
              <option>Shopping</option>
              <option>Health</option>
              <option>Other</option>
            </select>
          </label>

          <label style={styles.label}>
            Date
            <input
              style={styles.input}
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <div style={styles.actions}>
            <button type="submit" style={styles.primaryButton}>
              {editingId ? "Update Expense" : "Add Expense"}
            </button>

            {editingId && (
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {message && <p role="status">{message}</p>}
      </section>

      <section style={styles.card}>
        <h2>Your Expenses</h2>

        <h3>Total recorded expenses: ₹{totalExpenses.toLocaleString("en-IN")}</h3>

        {loading ? (
          <p>Loading expenses...</p>
        ) : expenses.length === 0 ? (
          <p>No expenses added yet.</p>
        ) : (
          <div style={styles.expenseList}>
            {expenses.map((expense) => (
              <article key={expense._id} style={styles.expense}>
                <div>
                  <strong>{expense.title}</strong>
                  <p style={styles.details}>
                    {expense.category} ·{" "}
                    {expense.date
                      ? new Date(expense.date).toLocaleDateString()
                      : "No date"}
                  </p>
                  <strong>₹{Number(expense.amount).toLocaleString("en-IN")}</strong>
                </div>

                <div style={styles.actions}>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => handleEdit(expense)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    style={styles.deleteButton}
                    onClick={() => handleDelete(expense._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const styles = {
  page: {
    maxWidth: 900,
    margin: "0 auto",
    padding: 24,
    fontFamily: "Arial, sans-serif",
    color: "#1f2937"
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: 24
  },
  card: {
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: 20,
    marginTop: 24
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  input: {
    padding: 10,
    border: "1px solid #9ca3af",
    borderRadius: 6,
    fontSize: 16,
    boxSizing: "border-box",
    width: "100%"
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
    marginTop: 8
  },
  primaryButton: {
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  secondaryButton: {
    background: "#e5e7eb",
    color: "#111827",
    padding: "8px 12px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  deleteButton: {
    background: "#dc2626",
    color: "#ffffff",
    padding: "8px 12px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },
  expenseList: {
    display: "grid",
    gap: 12
  },
  expense: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid #e5e7eb",
    padding: "12px 0"
  },
  details: {
    color: "#6b7280",
    margin: "6px 0"
  }
};

export default App;
