# 🚀 Team Task Manager

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express.js-Framework-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![JWT](https://img.shields.io/badge/Auth-JWT-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

A production-ready **Team Task Manager** built with **Node.js, Express, MongoDB Atlas, EJS, JWT cookies, and bcrypt password hashing**.

---

## ✨ Features

- 🔐 Secure Authentication (JWT + HTTP-only cookies)
- 👥 Role-based access (**Admin / Member**)
- 📊 Dashboard with task insights & overdue tracking
- 📁 Project management system
- ✅ Task assignment, status updates, and tracking
- 🔍 Advanced filtering & search
- ⏱️ Start/Stop work tracking
- 📱 Responsive UI with sidebar navigation
- 🛡️ Admin approval workflow

---

## 🛠️ Tech Stack

| Layer        | Technology |
|-------------|------------|
| Backend     | Node.js, Express |
| Database    | MongoDB Atlas |
| Frontend    | EJS |
| Auth        | JWT (cookies) |
| Security    | bcryptjs |

---

## ⚙️ How It Works

### 🔐 Authentication
- Passwords hashed using `bcryptjs`
- JWT stored in HTTP-only cookies
- Middleware protects routes

### 👤 Roles

#### 🧑‍💼 Admin
- Manage projects & members
- Assign & manage tasks
- Review admin requests

#### 👨‍💻 Member
- View assigned tasks
- Update task status
- Track working time

---

## 🔄 Admin Approval Workflow

1. User selects **Admin** during signup  
2. Created as **Member** initially  
3. `AdminRequest` is generated  
4. Admin reviews request  
5. Approval → Role upgraded  

---

## 🗂️ Data Models

### User
- `name`
- `email`
- `password`
- `role`

### Project
- `name`
- `description`
- `members[]`
- `createdBy`

### Task
- `title`
- `description`
- `status`
- `dueDate`
- `assignedTo`
- `projectId`
- `createdBy`

### AdminRequest
- `requestedBy`
- `reason`
- `status`
- `reviewedBy`
- `reviewedAt`

---

## 📡 API Routes

**Base Path:** `/api`

### 🔐 Auth
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`

### 📁 Projects
- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `POST /projects/:id/members`
- `DELETE /projects/:id/members/:memberId`
- `DELETE /projects/:id`

### ✅ Tasks
- `GET /tasks/dashboard/summary`
- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks`
- `PUT /tasks/:id`
- `PATCH /tasks/:id/status`
- `DELETE /tasks/:id`

### 🛡️ Admin Requests
- `GET /admin-requests`
- `GET /admin-requests/mine`
- `PATCH /admin-requests/:id/review`

---

## 🧪 Demo Accounts

| Role   | Email               | Password     |
|--------|---------------------|--------------|
| Admin  | admin@gmail.com     | `123456` |
| Member | member@gmail.com    | `123456` |

---

## 💻 Local Setup

```bash
# Install dependencies
npm install

# Create .env file
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret

# Start server
npm start
```

---

## ⚠️ Common Issues

### MongoDB Connection Error
- Make sure your MongoDB Atlas cluster is running  
- Whitelist your IP address (`0.0.0.0/0` for testing)

### JWT Error
- Ensure `JWT_SECRET` is defined in `.env`

### Port Already in Use
Update your server port:
```js
const PORT = process.env.PORT || 5000;
```

---

## ❤️ Author

Made with ❤️ by **Abhinav**
