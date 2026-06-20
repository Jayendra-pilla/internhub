# 🚀 InternHub – Full Stack Internship Management System

InternHub is a modern full-stack internship management platform that connects students with internship opportunities. The platform enables users to register, upload resumes, apply for internships, track application status, manage profiles, and receive password reset emails. It also provides an admin dashboard for managing internships and applications.

---

## 🌐 Live Demo

**Frontend:** https://internhub-mocha.vercel.app

**Backend API:** https://internhub-gbuo.onrender.com

---


### Home Page

* Modern landing page
* Internship discovery platform
* Responsive UI

### Dashboard

* Total Applications
* Pending Applications
* Under Review Applications
* Accepted Applications
* Rejected Applications

### Admin Panel

* Manage internships
* View applications
* Update application status

### Profile Page

* Resume upload
* Resume PDF preview
* Password management

---

## ✨ Features

### 👨‍🎓 Student Features

* User Registration & Login
* JWT Authentication
* Protected Routes
* Browse Available Internships
* Search & Filter Internships
* Apply for Internships
* Application Tracking
* Dashboard Analytics
* Resume Upload
* Resume PDF Preview
* Profile Management
* Change Password
* Forgot Password
* Password Reset via Email

### 👨‍💼 Admin Features

* Admin Login
* Role-Based Access Control
* Manage Internship Listings
* View All Applications
* Update Application Status
* Dashboard Overview
* Application Monitoring

---

## 🔐 Authentication & Security

* JWT Token Authentication
* Password Hashing
* Protected API Routes
* Role-Based Authorization
* Secure Password Reset Tokens
* Email Verification Flow

---

## 📊 Dashboard Analytics

The dashboard provides:

* Total Applications Count
* Pending Applications Count
* Under Review Applications Count
* Accepted Applications Count
* Rejected Applications Count
* Recent Applications Overview

---

## 📄 Resume Management

Users can:

* Upload Resume Files
* Store Resume Information
* Preview PDF Resume
* Use Resume During Applications

---

## 📧 Email Functionality

InternHub includes email integration for:

* Password Reset Requests
* Secure Reset Links
* Email-Based Account Recovery

Powered by Gmail SMTP and FastAPI backend services.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* React Router DOM
* Axios
* CSS3
* Responsive Design

### Backend

* FastAPI
* Python
* JWT Authentication
* SMTP Email Service
* REST APIs

### Database

* MongoDB Atlas
* Motor (Async MongoDB Driver)

### Cloud Services

* Cloudinary (Resume Storage)

### Deployment

* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas (Database)

---

## 📂 Project Structure

```bash
internhub/
│
├── backend/
│   ├── database.py
│   ├── email_utils.py
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Applications.jsx
│   │   ├── Internships.jsx
│   │   ├── Profile.jsx
│   │   ├── Admin.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   └── NotFound.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── App.css
│
├── public/
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚙️ Installation & Setup

### Clone Repository

```bash
git clone https://github.com/Jayendra-pilla/internhub.git

cd internhub
```

### Frontend Setup

```bash
npm install

npm run dev
```

### Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

---

## 🔑 Environment Variables

### Backend (.env)

```env
MONGODB_URL=your_mongodb_connection_string

DATABASE_NAME=internhub

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email

EMAIL_PASS=your_email_password

SECRET_KEY=your_secret_key

FRONTEND_URL=http://localhost:5174
```

### Frontend (.env)

```env
VITE_API_URL=https://internhub-gbuo.onrender.com
```

---

## 🚀 Deployment

### Frontend Deployment

Platform: Vercel

```bash
npm run build
```

### Backend Deployment

Platform: Render

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Database

MongoDB Atlas Cloud Database

---

## 🎯 Key Learning Outcomes

* Full Stack Development
* REST API Design
* JWT Authentication
* MongoDB Integration
* FastAPI Backend Development
* React Frontend Development
* Cloud Deployment
* Git & GitHub Workflow
* Email Service Integration
* Resume File Handling

---

## 🔮 Future Enhancements

* AI Resume Analysis
* ATS Resume Scoring
* Resume–Job Matching
* Company Portal
* Interview Scheduling
* Email Notifications for Status Updates
* Analytics Dashboard
* GitHub OAuth Login
* Docker Containerization
* CI/CD Pipeline

---

## 👨‍💻 Author

**Jayendra Pilla**

B.Tech – Computer Science & Engineering (AI)

GitHub:
https://github.com/Jayendra-pilla

---

## ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.
