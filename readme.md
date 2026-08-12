# AI-Powered Task Management Portal

A full-stack task management application built as part of the **Java
Full Stack Developer Intern Take-Home Assignment**.

## Overview

The application allows users to register and log in, create and manage
tasks, track task status, and use an AI-powered feature to assist with
task management.

## Features

-   User registration and login
-   JWT-based authentication
-   Protected APIs
-   Create, edit, and delete tasks
-   Update task status:
    -   `TODO`
    -   `IN_PROGRESS`
    -   `DONE`
-   Task priority management
-   Due dates
-   Task creation timestamp
-   Responsive frontend
-   REST API integration
-   Database integration
-   AI-powered task automation

## Tech Stack

### Backend

-   Java
-   Spring Boot
-   Spring REST
-   Spring Security
-   JWT Authentication
-   Maven
-   MySQL

### Frontend

-   React
-   Vite
-   Tailwind CSS
-   JavaScript

### Database

-   MySQL

### AI

The application integrates an AI-powered automation feature to assist
with task creation.

> **Important:** Update this section with the exact AI provider you
> actually used (OpenAI, Gemini, or Hugging Face) before submitting.

## Project Structure

``` text
AI-Task-Manager/
├── backend/
│   └── src/
│       └── main/
│           ├── java/
│           └── resources/
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

## Architecture

The application follows a layered full-stack architecture.

``` text
React + Vite Frontend
        |
        | REST API
        v
Spring Boot Backend
        |
        +-- Controller Layer
        |
        +-- Service Layer
        |
        +-- Repository Layer
        |
        v
      MySQL

Spring Boot Backend
        |
        v
     AI Service
```

## Backend Setup

### Prerequisites

Make sure the following are installed:

-   Java
-   Maven
-   MySQL
-   Node.js and npm

### 1. Clone the repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd AI-Task-Manager
```

### 2. Configure MySQL

Create a MySQL database for the application.

Example:

``` sql
CREATE DATABASE ai_task_manager;
```

Configure the database connection in:

``` text
backend/src/main/resources/application.properties
```

Do not commit passwords, JWT secrets, or AI API keys to GitHub. Use
environment variables for sensitive configuration.

### 3. Start the backend

From the `backend` directory:

``` bash
mvn spring-boot:run
```

The backend will start on the configured Spring Boot port.

## Frontend Setup

From the `frontend` directory:

``` bash
npm install
npm run dev
```

Open the local URL displayed by Vite in the terminal.

## Authentication Flow

1.  A user registers with the application.
2.  The backend validates the registration data.
3.  The password is securely stored using password hashing.
4.  The user logs in.
5.  The backend generates a JWT token.
6.  The frontend uses the token when calling protected APIs.
7.  The backend validates the JWT before allowing access to protected
    resources.

## Task Management Flow

Users can:

1.  Create a task.
2.  Enter a title and description.
3.  Set priority and due date.
4.  View their tasks.
5.  Edit task information.
6.  Change task status.
7.  Delete tasks when they are no longer required.

## AI Workflow

The AI feature is designed to assist the user during task creation.

Example workflow:

``` text
User enters task title
        |
        v
Frontend sends request
        |
        v
Spring Boot backend
        |
        v
AI service
        |
        v
Generated task information
        |
        v
Backend response
        |
        v
Frontend displays result
```

The AI automation can generate task-related information such as:

-   Task description
-   Suggested priority
-   Estimated completion effort

The application should also handle AI service failures gracefully.

> **Before submission:** replace this section with the exact AI workflow
> implemented in the project.

## API Endpoints

Document the actual endpoints implemented in the project here.

Example format:

  Method   Endpoint               Description       Authentication
  -------- ---------------------- ----------------- ----------------
  POST     `/api/auth/register`   Register a user   No
  POST     `/api/auth/login`      Login             No
  GET      `/api/tasks`           Get tasks         Yes
  POST     `/api/tasks`           Create task       Yes
  PUT      `/api/tasks/{id}`      Update task       Yes
  DELETE   `/api/tasks/{id}`      Delete task       Yes

> Update these endpoints to match the actual backend implementation
> before submission.

## Database Schema

The main task data includes:

-   Title
-   Description
-   Priority
-   Due Date
-   Status
-   Created Timestamp

User data is used for authentication and task ownership.

Add the final ER diagram or database schema screenshot to the submission
materials.

## Environment Variables

Sensitive configuration should be stored using environment variables.

Example:

``` text
DB_URL=
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET=
AI_API_KEY=
```

Do not commit real API keys, passwords, or secrets to GitHub.

## Running the Complete Application

Start the backend:

``` bash
cd backend
mvn spring-boot:run
```

In another terminal, start the frontend:

``` bash
cd frontend
npm install
npm run dev
```

Then open the frontend URL shown by Vite.

## Testing Checklist

Before submission, verify:

-   [ ] User registration works
-   [ ] User login works
-   [ ] JWT authentication works
-   [ ] Protected APIs reject unauthenticated requests
-   [ ] Task creation works
-   [ ] Task editing works
-   [ ] Task deletion works
-   [ ] Task status changes work
-   [ ] Database records are saved correctly
-   [ ] AI feature works
-   [ ] AI failure is handled gracefully
-   [ ] Frontend is responsive
-   [ ] No secrets are committed to GitHub

## Deployment

Deployment is optional for this assignment.

If the application is hosted, add the deployment URL here:

``` text
Deployment URL: <YOUR_DEPLOYMENT_URL>
```

If it is not hosted, this section can state:

``` text
The application is currently run locally.
```

## Demo Video

Demo video:

``` text
<YOUR_GOOGLE_DRIVE_OR_VIDEO_LINK>
```

The demo should cover:

1.  Application overview
2.  Registration/login
3.  Task creation and management
4.  AI feature
5.  Application architecture
6.  Challenges and solutions

## Submission Links

### GitHub Repository

``` text
<YOUR_GITHUB_REPOSITORY_URL>
```

### Demo Video

``` text
<YOUR_DEMO_VIDEO_LINK>
```

### Deployment

``` text
<YOUR_DEPLOYMENT_URL_OR-NOT-HOSTED>
```

## Assumptions

-   Each user manages their own tasks.
-   Authentication is required for protected task operations.
-   Task status is maintained using `TODO`, `IN_PROGRESS`, and `DONE`.
-   MySQL is used as the application database.
-   Sensitive credentials are provided through environment variables.
-   Deployment is optional and the application can be demonstrated
    locally.

## Future Improvements

Possible future enhancements include:

-   Role-based access control
-   Pagination
-   Search and filtering
-   Unit and integration testing
-   Swagger/OpenAPI documentation
-   Docker setup
-   Blockchain-based task history

## Assignment Context

This project was developed for the **Java Full Stack Developer Intern
--- Take-Home Assignment** and demonstrates backend API development,
frontend development, database integration, authentication, AI-powered
automation, clean architecture, and deployment readiness.
