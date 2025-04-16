
# SavingCircle - Group Savings App

A modern web application that allows users to create savings groups, contribute money, track savings, and withdraw funds.

## Features

- User Authentication (Sign up, Login, Profile management)
- Group Management (Create, Join, Leave)
- Contribution System
- Withdrawal Requests with Admin approval
- Transaction History
- Dark Mode UI

## Tech Stack

### Frontend
- React with TypeScript
- TailwindCSS for styling
- React Router for navigation
- Modern Apple-inspired UI with dark mode support

### Backend
- Flask API
- SQLAlchemy ORM
- PostgreSQL Database
- JWT Authentication

## Getting Started

### Running the Frontend

```bash
# Install dependencies
npm install

# Create a .env.local file with the following content:
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

### Running the Backend

```bash
# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows
venv\Scripts\activate
# On MacOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (for development)
# On Windows
set FLASK_APP=app.py
set FLASK_ENV=development
# On MacOS/Linux
export FLASK_APP=app.py
export FLASK_ENV=development

# Run the development server
flask run
```

## Database Setup

1. Create a PostgreSQL database named `savingcircle`
2. Update the database connection string in `app.py` if needed
3. The application will automatically create the necessary tables on first run

## API Endpoints

The backend provides the following API endpoints:

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in a user
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create a new group
- `GET /api/groups/<id>` - Get group details
- `POST /api/groups/<id>/join` - Join a group
- `POST /api/groups/<id>/contribute` - Make a contribution
- `POST /api/groups/<id>/withdraw` - Request a withdrawal
- `POST /api/withdrawals/<id>/process` - Process a withdrawal request
- `GET /api/discover` - Discover groups to join
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
