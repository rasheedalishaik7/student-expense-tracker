# Student Expense Tracker

A web application built to help students manage their daily expenses, monitor spending, and maintain daily and monthly budgets.

## Features

- **Add Expenses:** Record expenses with a name, amount, category, and date.
- **View Expenses:** Display saved expenses.
- **Update Expenses:** Edit existing expense details.
- **Delete Expenses:** Remove unwanted expense records.
- **Budget Management:** Set daily and monthly budget limits.
- **Budget Warnings:** Receive warnings when spending reaches or exceeds a budget limit.
- **Database Storage:** Store expense records in MongoDB Atlas.

## Technologies Used

- **Frontend:** React.js, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **API Testing:** Postman
- **Version Control:** Git and GitHub

## Project Structure

```text
student-expense-tracker/
├── backend/
│   ├── models/
│   │   ├── Budget.js
│   │   └── Expense.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── BudgetPanel.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
└── .gitignore
```

## Prerequisites

Install the following before running the application:

- Node.js and npm
- MongoDB Atlas account
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/rasheedalishaik7/student-expense-tracker.git
cd student-expense-tracker
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder and add your MongoDB Atlas connection string and server port using the variable names expected by `server.js`.

**Important:** Keep your actual database credentials private. Never upload your `.env` file to GitHub.

### 3. Start the backend

From the `backend` folder, run:

```bash
node server.js
```

The backend uses port `5001` in the current project configuration.

### 4. Start the frontend

Open a second Terminal window and run:

```bash
cd student-expense-tracker/frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## API Endpoints

The backend provides REST API operations for expenses.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/expenses` | Retrieve expenses |
| POST | `/api/expenses` | Add an expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

## Database

The application uses MongoDB Atlas to store expense data in the `student_expense_tracker` database.

## Future Enhancements

- Expense reports and charts
- Monthly spending summaries
- Expense filtering by category
- Improved mobile responsiveness

## Author

**Shaik Rasheed Ali**

GitHub: [@rasheedalishaik7](https://github.com/rasheedalishaik7)
