# Course & Question Bank Management Platform

A premium, full-stack course management platform built with a Java Spring Boot backend (v3.2.5), a React.js frontend (v18.2.0, Vite v5.2.11), and a MySQL database. It supports dynamic course layouts based on course types (`LEARNING` vs `QUESTION_BANK`), drag-and-drop ordering, soft delete with restoration support, dynamic color theme accentuation, and a unified glassmorphic dark-theme visual design.

---

## Folder Structure

```
PavanXDcl/
├── backend/                             # Spring Boot Project
│   ├── pom.xml                          # Maven configuration
│   ├── mvnw / mvnw.cmd                  # Maven wrapper executable
│   └── src/main/java/com/coursemanager/
│       ├── config/                      # CORS config
│       ├── controller/                  # REST Controllers (Spring MVC)
│       ├── dto/                         # Request & Response DTOs
│       ├── entity/                      # JPA Entities
│       ├── exception/                   # Custom exception & Global advice
│       ├── mapper/                      # Explicit static object mapping
│       ├── repository/                  # Spring Data JPA Repository
│       └── service/                     # Service Interfaces & Implementations
├── frontend/                            # React.js SPA (Vite)
│   ├── package.json                     # Node dependencies
│   ├── vite.config.js                   # Vite configuration
│   └── src/
│       ├── components/                  # Shared UI components
│       ├── pages/                       # PublicPortal, AdminDashboard
│       ├── services/                    # api.js client (Fetch based)
│       ├── index.css                    # Custom CSS tokens & animation
│       └── App.jsx                      # App view coordinator
└── README.md                            # Documentation
```

---

## Technologies Used

- **Backend**: Java 21, Spring Boot 3.2.5, Spring Data JPA, Hibernate, Jakarta Validation (JSR-380), Logback.
- **Frontend**: HTML5, CSS3 (Vanilla variable themes & glassmorphic styling), JavaScript (ES6+), React.js 18.2.0, Vite 5.2.11.
- **Database**: MySQL 8.0.

---

## Database Configuration & Setup

1. **MySQL Setup**:
   Ensure MySQL server is running locally on port `3306`.
   Use the default database credentials:
   - **User**: `root`
   - **Password**: `root`

2. **Database Schema Initialization**:
   The Spring Boot application automatically creates the database and initializes the tables using Hibernate's `ddl-auto=update` configuration.
   To create the database manually, you can execute:
   ```sql
   CREATE DATABASE IF NOT EXISTS course_management;
   ```

---

## Import Steps for Eclipse IDE (Community Edition)

1. Open **Eclipse IDE**.
2. Go to **File** -> **Import...**
3. Select **Maven** -> **Existing Maven Projects** and click **Next**.
4. Browse and select the `backend` folder as the Root Directory:
   `c:\Users\abdul\Desktop\DCL\PavanXDcl\backend`
5. Ensure `pom.xml` is selected, and click **Finish**.
6. Eclipse will import the project and resolve all Maven dependencies automatically from the maven wrapper.
7. To run from Eclipse: Right-click the project -> **Run As** -> **Spring Boot App** (or run `BackendApplication.java`).

---

## Running the Application Locally

### Running the Backend (Spring Boot)

Navigate to the `backend/` directory and execute:
```powershell
# Using the Maven Wrapper (Windows)
.\mvnw.cmd spring-boot:run
```
The backend server runs on: `http://localhost:8080`

### Running the Frontend (React + Vite)

Navigate to the `frontend/` directory and execute:
```powershell
# Install Node dependencies (if not done)
npm install

# Start the Vite local development server
npm run dev
```
The frontend dev server runs on: `http://localhost:5173` (or `http://localhost:3000`).

---

## Standardized REST API Endpoints

### 1. Courses
- `GET /api/courses` - Fetch active courses.
- `GET /api/courses/deleted` - Fetch soft-deleted courses in the bin.
- `GET /api/courses/{id}` - Fetch course by ID.
- `POST /api/courses` - Create course (accepts `courseType` `LEARNING` or `QUESTION_BANK`).
- `PUT /api/courses/{id}` - Edit course name, description, theme, etc.
- `DELETE /api/courses/{id}` - Soft delete a course.
- `PUT /api/courses/{id}/restore` - Restore a soft-deleted course.
- `PUT /api/courses/reorder` - Reorder active courses (takes ordered list of IDs in request body).

### 2. Modules / Topics
- `GET /api/courses/{courseId}/modules` - Fetch active modules/topics.
- `GET /api/courses/{courseId}/modules/deleted` - Fetch soft-deleted modules/topics in the bin.
- `POST /api/courses/{courseId}/modules` - Add module/topic to course.
- `PUT /api/modules/{id}` - Update module/topic details.
- `DELETE /api/modules/{id}` - Soft delete module/topic.
- `PUT /api/modules/{id}/restore` - Restore soft-deleted module/topic.
- `PUT /api/modules/reorder` - Reorder active modules/topics.

### 3. Sessions (LEARNING Course Content)
- `GET /api/modules/{moduleId}/sessions` - Fetch active sessions.
- `GET /api/modules/{moduleId}/sessions/deleted` - Fetch soft-deleted sessions.
- `POST /api/modules/{moduleId}/sessions` - Create session under module.
- `PUT /api/sessions/{id}` - Update session code, title, and importance level.
- `DELETE /api/sessions/{id}` - Soft delete session.
- `PUT /api/sessions/{id}/restore` - Restore session.
- `PUT /api/sessions/reorder` - Reorder active sessions.
- `POST /api/sessions/{sessionId}/resources` - Add a file/resource link.
- `DELETE /api/resources/{resourceId}` - Permanently delete a resource.
- `POST /api/sessions/{sessionId}/practice-links` - Add a practice task link.
- `DELETE /api/practice-links/{practiceLinkId}` - Permanently delete a practice task.

### 4. Questions (QUESTION_BANK Course Content)
- `GET /api/modules/{topicId}/questions` - Fetch active questions for a topic.
- `GET /api/modules/{topicId}/questions/deleted` - Fetch soft-deleted questions.
- `POST /api/modules/{topicId}/questions` - Create MCQ question with options, difficulty level, correct answer, and explanation.
- `PUT /api/questions/{id}` - Update MCQ question.
- `DELETE /api/questions/{id}` - Soft delete question.
- `PUT /api/questions/{id}/restore` - Restore question.
- `PUT /api/questions/reorder` - Reorder active questions.

---

## Git Commit History

Commit checkpoints followed:
1. `Initial Project Setup` - Workspace structures, standard configs, gitignore.
2. `Database Configuration` - Setup properties, standardised response formats, global handlers, and CORS.
3. `Course CRUD` - Entities, DTOs, mappers, services, and endpoints for courses.
4. `Module CRUD` - Scoped module / topic management.
5. `Session CRUD & Resource & Practice Management` - Session assets and downloads.
6. `Question Bank CRUD` - MCQ questions, tag filters, options element collections, and correct answer validators.
7. `Frontend Dashboard & Public Website with Theme and Reordering Support` - Frontend views, design system, interactive check mechanics, and HTML5 drag reorder.
8. `Final Polish` - Documentation and verification tests.
