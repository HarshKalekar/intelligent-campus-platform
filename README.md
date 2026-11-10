# CampusConnect – Intelligent Campus Opportunity Discovery Platform

CampusConnect is a web-based platform designed to connect students with relevant campus opportunities, including internships, workshops, hackathons, research projects, and other skill-building activities.

The platform helps students discover opportunities based on their skills and interests while enabling organizers to publish opportunities and manage student applications.

## Key Features

### Student Features

- Student registration and login.
- Student profile management.
- Add and update technical skills with proficiency levels.
- Browse published campus opportunities.
- Apply for available opportunities.
- Track application status.
- View personalized opportunity recommendations based on skill matches.

### Organizer Features

- Organizer authentication.
- Create and manage opportunities.
- Save opportunities as drafts.
- Publish opportunities.
- View student applications.
- Review applicant details.
- Shortlist, accept, or reject applications.

### Intelligent Recommendation System

- Matches student skills with the skills required by opportunities.
- Calculates a skill-match percentage.
- Ranks opportunities based on matching skills.
- Helps students identify opportunities relevant to their current skill set.

## Technology Stack

| Layer                   | Technologies               |
| ----------------------- | -------------------------- |
| Frontend                | Next.js, React, TypeScript |
| Backend                 | Node.js, Express.js        |
| Relational Database     | MySQL                      |
| NoSQL / Vector Database | MongoDB, ChromaDB          |
| Authentication          | JWT                        |
| API Testing             | Postman                    |
| Version Control         | Git and GitHub             |

## Project Structure

```text
intelligent-campus-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── server.js
│   │   └── test-connections.js
│   ├── package.json
│   └── package-lock.json
├── database/
│   ├── 01_schema.sql
│   ├── 02_seed.sql
│   └── 03_queries.sql
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── README.md
├── postman/
├── vector_db/
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MySQL
- MongoDB
- Python 3
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd intelligent-campus-platform
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5001

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=intelligent_campus

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_random_secret
```

Replace the placeholder values with your local database credentials.

Start the backend:

```bash
npm run dev
```

If the project does not have a development script configured, use:

```bash
node src/server.js
```

Backend URL: `http://localhost:5001`

### 3. Configure the Database

Create the MySQL database and execute the SQL scripts in the following order:

1. `database/01_schema.sql`
2. `database/02_seed.sql`
3. `database/03_queries.sql` (for the provided queries and database operations)

Ensure MySQL is running before starting the backend.

Configure MongoDB using the connection string in the backend `.env` file.

### 4. Configure the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file inside the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:3000`

## API Overview

| Module          | Endpoint                       | Purpose                               |
| --------------- | ------------------------------ | ------------------------------------- |
| Authentication  | `/api/auth`                    | Registration and login                |
| Opportunities   | `/api/opportunities`           | Browse opportunities                  |
| Categories      | `/api/categories`              | Retrieve opportunity categories       |
| Applications    | `/api/applications`            | Submit and track applications         |
| Student Profile | `/api/student/profile`         | Manage student profile                |
| Student Skills  | `/api/student/skills`          | Manage skills and proficiency         |
| Recommendations | `/api/student/recommendations` | Retrieve personalized recommendations |
| Organizer       | `/api/organizer`               | Manage opportunities and applicants   |

Protected endpoints require JWT authentication.

## Recommendation Methodology

CampusConnect compares the skills selected by a student with the skills associated with each published opportunity.

The match percentage is calculated as:

**Match Percentage = (Number of Matching Skills / Total Required Skills) × 100**

Opportunities are ranked according to their match percentage, helping students prioritize relevant opportunities.

## Security

- JWT-based authentication.
- Role-based authorization for students and organizers.
- Passwords are stored as hashes.
- Organizer access is restricted to opportunities they manage.
- Environment variables are used for database credentials and authentication secrets.

## Future Enhancements

- Advanced recommendations incorporating skill proficiency.
- Resume upload and profile-based matching.
- Email notifications for application status updates.
- Advanced search and filtering.
- Analytics dashboard for organizers.
- Improved vector-based semantic opportunity discovery.

## Project Information

**Project:** CampusConnect – Intelligent Campus Opportunity Discovery Platform

**Student:** Harsh Kalekar

**SRN:** PES1UG24CS183

**University:** PES University

**Department:** Computer Science and Engineering
