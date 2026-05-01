# Team Task Manager

A production-ready Team Task Manager built with Node.js, Express, MongoDB Atlas, EJS, JWT cookies, and bcrypt password hashing.

## Features

- Signup and login
- JWT auth stored in HTTP-only cookies
- Password hashing with bcrypt
- Admin role: create projects, add members, assign tasks
- Member role: view assigned tasks and update status
- Dashboard with total tasks, status counts, and overdue tasks
- Signup account type selection for member or admin
- Members are active immediately
- First admin is approved automatically; later admin requests appear on the admin dashboard for approval
- Responsive sidebar/mobile navigation
- Task search and filters by status, project, and assignee
- Project detail page with progress and project tasks
- Admin task edit and delete actions
- Team status panel scoped to the current admin's project members
- Start/stop work tracking so admins can see the exact task a member is working on

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`:

```bash
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
```

3. Start the app:

```bash
npm start
```

4. Optional: add demo data:

```bash
npm run seed
```

Demo login password for all demo accounts:

```text
Demo@12345
```

Demo accounts:

```text
admin@demo.com
asha@demo.com
rohan@demo.com
pending-admin@demo.com
```

5. Open:

```text
http://localhost:5000
```

The root route returns `App Running`. App pages are available at `/auth/signup`, `/auth/login`, `/dashboard`, `/projects`, and `/tasks`.

## Railway Deployment

1. Push this project to GitHub.
2. Create a new Railway project and choose **Deploy from GitHub repo**.
3. Add these Railway variables:

```bash
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret
NODE_ENV=production
```

4. Railway will run:

```bash
npm install
npm start
```

5. The app listens with:

```js
app.listen(process.env.PORT || 5000)
```

No build command is required.
