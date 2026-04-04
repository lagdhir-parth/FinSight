## 🚀 FinSight
A role-based personal finance records & analytics system with secure, cookie-based JWT authentication.

---

## 📌 Overview

**FinSight** is a full-stack finance tracking platform that helps users **record income/expenses**, **manage users with role-based access**, and **view dashboard analytics** (totals, trends, category breakdown, and recent activity).

It solves the common problem of scattered expense tracking by providing:
- a structured **financial record system** (CRUD + search + soft delete/restore),
- **authenticated access** using JWTs (access + refresh),
- **authorization gates** for admin/analyst workflows,
- a **dashboard API** that summarizes financial health.

---

## 🧠 Key Features

- **Authentication (JWT + Refresh Tokens via HttpOnly cookies)**
  - Login sets `accessToken` + `refreshToken` cookies
  - Refresh endpoint issues new tokens
  - Supports both Cookie auth and `Authorization: Bearer <token>` header

- **Role-Based Access Control (RBAC)**
  - Roles: `viewer`, `analyst`, `admin`
  - Route-level authorization via middleware

- **Financial Records Management**
  - Create income/expense records (analyst/admin)
  - Paginated record browsing
  - “My Records” view scoped to logged-in user
  - Record updates (self-service updates + admin updates)
  - Soft delete, restore, and permanent delete (admin-only where applicable)

- **Search & Filtering**
  - Search records by `title`, `type`, `category`, `note` using case-insensitive matching

- **Dashboard Analytics**
  - Total income, total expense, net balance
  - Category-wise totals (income/expense)
  - Monthly trend summary
  - Recent activity list (last 5 user records)

- **Production-minded middleware**
  - CORS allowlist
  - Helmet security headers
  - Response compression
  - Centralized error handling

---

## 🏗️ Tech Stack

### Backend
- **Node.js + Express** (Express 5, ESM modules)
- **MongoDB + Mongoose** (data modeling + persistence)
- **Auth**
  - **jsonwebtoken** for JWT signing/verification
  - **bcryptjs** for password hashing
  - Tokens stored in **HttpOnly cookies** (via `cookie-parser`)
- **Security & Performance**
  - `helmet`, `cors`, `compression`
  - `express-rate-limit` is installed (usage may be added later; see assumptions)

### Frontend (Client)
- **React (Vite)**
- **@tanstack/react-query** for server-state management
- **axios** with `withCredentials: true` (cookie-based auth)
- **react-router-dom** for routing
- **Tailwind CSS**
- **Recharts** for dashboard visualization
- **react-hot-toast** for notifications

---

## 📂 Project Structure

### Backend (`server/`)
```text
server/
├── app.js                     # Express app, middlewares, routes, global error handler
├── server.js                  # DB bootstrap + server listen
└── src/
    ├── config/
    │   ├── db.js              # MongoDB connection
    │   └── env.js             # Loads + validates required env vars
    ├── controllers/
    │   ├── auth.controller.js # register/login/logout/me/refresh
    │   ├── user.controller.js # user CRUD + profile ops
    │   ├── record.controller.js # record CRUD + pagination + search + soft delete/restore
    │   └── dashboard.controller.js # analytics aggregation in JS
    ├── middlewares/
    │   ├── verifyUser.middleware.js # JWT verification (cookie or Authorization header)
    │   └── verifyRole.middleware.js # RBAC enforcement
    ├── models/
    │   ├── user.model.js      # User schema, hashing, token generators
    │   └── record.model.js    # Financial record schema
    ├── utils/
    │   ├── apiError.js        # Typed error class used across the app
    │   ├── apiResponse.js     # Consistent response envelope
    │   ├── asyncHandler.js    # Promise wrapper for controllers
    │   ├── generateTokens.js  # Generates + stores refresh token
    │   └── validateDataUpdates.js # Field allowlist validation for PATCH updates
    └── validations/
        ├── authRequest.js     # request validations for auth endpoints
        ├── userRequest.js     # validations for user/profile endpoints
        └── recordRequest.js   # validations for record endpoints
```

### Frontend (`client/`)
```text
client/
├── src/
│   ├── api/                  # Axios client + API wrappers (auth/users/records/dashboard)
│   ├── pages/                # Dashboard, Records, Login/Register, Users, Profile, etc.
│   ├── routes/               # Protected/Guest routing guards
│   └── features/auth/        # Auth context (used by ProtectedRoute)
└── vite.config.js            # Vite + Tailwind plugin
```

---

## 🔐 Authentication & Authorization

### How authentication works
- **Login** (`POST /api/auth/login`) issues:
  - `accessToken` (short-lived, used on each request)
  - `refreshToken` (longer-lived, used to obtain a new access token)
- Tokens are set as **HttpOnly cookies**:
  - `secure: true`
  - `sameSite: "None"`
  - This configuration is designed for cross-site cookie usage (e.g., mobile/web deployments).

### How authorization works (RBAC)
Authorization is enforced with a middleware that checks `req.user.role` against allowed roles.

#### Roles
- **Viewer**
  - Standard authenticated user
  - Can fetch their profile and access user-scoped record endpoints (ex: “my records”)
- **Analyst**
  - Can create financial records
  - Can access user listing (same as admin for that specific endpoint)
- **Admin**
  - Full control:
    - update/delete users by id
    - soft-delete records, restore records, permanently delete records
    - list soft-deleted records

> Note: The backend enforces role checks on specific endpoints (see API table below).

---

## 💰 Financial Records System

### Data model (Record)
Each record represents an **income** or **expense** entry created by a user.

**Key fields**
- `title` *(String, required)*
- `createdBy` *(ObjectId → User, required)*
- `amount` *(Number, required, min: 1)*
- `type` *(String enum: `income` | `expense`)*
- `category` *(String enum)*:
  - `salary`, `freelance`, `investment`, `business`,
  - `food`, `transport`, `rent`, `shopping`, `entertainment`,
  - `health`, `education`, `utilities`, `travel`, `other`
- `date` *(Date, required, indexed)*
- `note` *(String, optional)*
- `isDeleted` *(Boolean, default: false)* for soft-delete behavior
- `timestamps` *(createdAt/updatedAt)*

### Record lifecycle
- **Create**: analyst/admin only
- **Read**:
  - global paginated list (non-deleted)
  - user-scoped paginated list (`/my-records`)
  - search endpoint
- **Update**:
  - user can update their own record (`/update-my-record/:id`)
  - admin can update any record (`PATCH /:id`)
- **Delete**:
  - soft-delete (admin only)
  - restore (admin only)
  - permanent delete (admin only)

---

## 📊 Dashboard & Analytics

The dashboard endpoint generates summary data from stored records, including:

- **Global totals**
  - `totalIncome`
  - `totalExpense`
  - `netBalance`
  - `totalRecords`

- **User totals** (scoped to logged-in user)
  - `userTotalIncome`
  - `userTotalExpense`
  - `userTotalRecords`

- **Category breakdown**
  - `categoryWiseStats` aggregates totals per category and type

- **Trends**
  - `MonthlyTrend` groups totals by month/year and type

- **Recent activity**
  - `recentActivity`: last 5 records for the user

> Implementation note: analytics are computed in application code using `Array.reduce()` rather than MongoDB aggregation pipelines.

---

## 📡 API Endpoints

### Auth APIs
| Method | Endpoint | Description | Access |
|-------:|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and set auth cookies | Public |
| POST | `/api/auth/logout` | Logout (clears cookies, nullifies refresh token) | Authenticated |
| POST | `/api/auth/refresh-access-token` | Refresh access/refresh token cookies | Public (requires refresh cookie) |
| GET | `/api/auth/me` | Get current authenticated user | Authenticated |

### User APIs
| Method | Endpoint | Description | Access |
|-------:|----------|-------------|--------|
| GET | `/api/users/:id` | Get a user by id | Authenticated |
| PATCH | `/api/users/profile` | Update own profile (`name`, `isActive`) | Authenticated |
| DELETE | `/api/users/profile` | Delete own profile (also soft-deletes their records) | Authenticated |
| GET | `/api/users` | List all users | `admin`, `analyst` |
| PATCH | `/api/users/:id` | Update user by id | `admin` |
| DELETE | `/api/users/:id` | Delete user by id (also soft-deletes their records) | `admin` |

### Record APIs
| Method | Endpoint | Description | Access |
|-------:|----------|-------------|--------|
| POST | `/api/records/create` | Create a new record | `analyst`, `admin` |
| GET | `/api/records` | Paginated list of all non-deleted records | Authenticated |
| GET | `/api/records/total-record-count` | Get count of non-deleted records | Authenticated |
| GET | `/api/records/my-records` | Paginated list of current user’s records | Authenticated |
| GET | `/api/records/search` | Search records by `title/type/category/note` | Authenticated |
| GET | `/api/records/soft-deleted` | Paginated list of soft-deleted records | `admin` |
| GET | `/api/records/:id` | Get a record by id | Authenticated |
| PATCH | `/api/records/update-my-record/:id` | Update your own record | Authenticated |
| PATCH | `/api/records/:id` | Update any record | `admin` |
| DELETE | `/api/records/:id` | Soft-delete a record | `admin` |
| PATCH | `/api/records/restore/:id` | Restore a soft-deleted record | `admin` |
| DELETE | `/api/records/permanent/:id` | Permanently delete a record | `admin` |

### Dashboard APIs
| Method | Endpoint | Description | Access |
|-------:|----------|-------------|--------|
| GET | `/api/dashboard/stats` | Get dashboard totals/trends/breakdowns | Authenticated |

---

## ⚙️ Environment Variables

Backend requires the following variables (validated at startup):

```bash
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/finsight
ALLOWED_ORIGINS=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=15d
```

### Frontend environment variables
The client reads the API base URL from:

```bash
VITE_API_URL=http://localhost:3000/api
```

If not provided, it defaults to `http://localhost:3000/api`.

---

## 🧪 Validation & Error Handling

### Validation approach
Validation is implemented via custom middleware (not via `express-validator`), including:
- required field checks (auth + record creation)
- enum validation for record `type` and `category`
- ObjectId validation for user/record ids
- update allowlist validation (prevents patching arbitrary fields)
- date validation (record date cannot be in the future)

### Error response shape
Errors are normalized by a global error handler:
- Custom errors throw `ApiError` with `statusCode`, `message`, and optional `errors`.
- Generic errors return a `500` response.

Typical error response:
```json
{
  "success": false,
  "message": "Validation failed ...",
  "errors": []
}
```

Typical success response uses a response envelope:
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { },
  "success": true
}
```

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (recommended: current LTS)
- MongoDB running locally or a hosted MongoDB URI

### 1) Clone the repository
```bash
git clone https://github.com/lagdhir-parth/FinSight.git
cd FinSight
```

### 2) Setup backend
```bash
cd server
npm install
```

Create `server/.env` with the required variables (see above), then run:
```bash
npm run dev
```

Backend should be available at:
- `http://localhost:3000`
- Health check: `GET http://localhost:3000/health`

### 3) Setup frontend
```bash
cd ../client
npm install
```

(Optional) create `client/.env`:
```bash
VITE_API_URL=http://localhost:3000/api
```

Run:
```bash
npm run dev
```

Frontend should be available at:
- `http://localhost:5173`

---

## 🔮 Assumptions & Design Decisions

- **Cookie-based JWT auth** was chosen to support browser/mobile clients with automatic credential handling (`withCredentials: true`) and to avoid storing tokens in localStorage.
- **RBAC is enforced at route level** via a dedicated middleware (`verifyRole`), keeping controllers clean and reducing duplication.
- **Soft deletion (`isDeleted`)** is used for records to allow admin recovery and audit workflows.
- **Dashboard analytics are computed in Node.js** using arrays/reducers rather than MongoDB aggregation pipelines—this is simpler to implement and reason about for smaller datasets, but may need optimization at scale.
- `express-rate-limit` exists in dependencies, but is not currently wired into the middleware chain (reasonable next step for production hardening).

---

## 🌟 Future Improvements

- Add **MongoDB aggregation pipelines** for analytics (faster & scalable).
- Implement **pagination for search** and consistently for all listing endpoints.
- Add **rate limiting** + request logging (e.g., pino/morgan) and structured error logs.
- Introduce **audit logs** for admin actions (user/record changes).
- Add **tests** (unit + integration) for controllers, middlewares, and validations.
- Support **custom categories** per user (instead of a fixed enum).
- Improve auth cookie configuration for local dev (toggle `secure` based on environment).

---

## 👨‍💻 Author

**Parth Lagdhir**  
GitHub: `@lagdhir-parth`