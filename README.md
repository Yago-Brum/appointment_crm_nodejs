# 🗓️ Appointment CRM (MERN Stack)

A comprehensive CRM (Customer Relationship Management) system for appointment management, built with the MERN stack (MongoDB, Express.js, React, Node.js). This project demonstrates the construction of a robust full-stack application, featuring secure authentication, role-based access control, and CRUD functionalities for clients and appointments.

## ✨ Project Highlights

* **Secure Authentication:** User login and registration system using JSON Web Tokens (JWT) stored in `httpOnly` cookies for enhanced security.
* **Role-Based Access Control (RBAC):** Differentiation of permissions for `admin` and `employee` users.
* **Client Management:** Full CRUD (Create, Read, Update, Delete) functionalities to manage client information.
* **Appointment Management:** Creation, viewing, updating, and deleting appointments, linked to specific clients, with details such as service, date, time, and status.
* **Calendar View:** (If implemented/planned) Visual interface for appointments.
* **Intuitive Dashboard:** Control panel for an overview of important data.
* **RESTful Architecture:** Clear and efficient communication between frontend and backend via a REST API.
* **Global State Management:** Utilization of React's Context API and Hooks for efficient state management in the frontend.

## 🚀 Technologies Used

### Backend (Node.js/Express)

* **Node.js:** JavaScript runtime environment.
* **Express.js:** Web framework for building the RESTful API.
* **MongoDB:** Flexible NoSQL database.
* **Mongoose:** ODM (Object Data Modeling) for MongoDB.
* **jsonwebtoken:** For JWT implementation.
* **bcryptjs:** For password hashing.
* **cookie-parser:** For handling HTTP cookies.
* **dotenv:** For environment variables.
* **cors:** To enable cross-origin requests.
* **express-async-handler:** For simplified error handling in asynchronous routes.

### Frontend (React)

* **React:** JavaScript library for building user interfaces.
* **React Router DOM:** For declarative routing within the application.
* **Axios:** HTTP client for making API requests.
* **Moment.js:** For date and time manipulation and formatting.
* **React Icons:** Icon library.
* **Tailwind CSS:** (If you are using it) Utility-first CSS framework for rapid and responsive styling.
* **Context API & Hooks:** For state management and reusable logic.

## ⚙️ Architecture

The application follows a traditional MERN stack architecture:

* **Frontend (React):** Consumes the backend's RESTful API. Manages the user interface, application state, and user interactions. Utilizes the Context API to manage global authentication state and custom hooks to abstract API call logic.
* **Backend (Node.js/Express):** Acts as the RESTful API, exposing endpoints for authentication, client management, and appointment management. Handles business logic, database interaction (MongoDB via Mongoose), and security (JWT authentication with `httpOnly` cookies and RBAC).
* **MongoDB:** NoSQL database that stores all application data.

Communication between the frontend and backend is done via HTTP requests (GET, POST, PUT, DELETE), with the JWT token securely transmitted via `httpOnly` cookies, which are automatically included in frontend requests due to the `withCredentials: true` configuration in Axios.

## 🚧 Technical Challenges and Learnings

During the development of this CRM, I faced and overcame several technical challenges, which were crucial for my full-stack development learning:

* **Secure JWT Authentication:** Implementing JWT with `httpOnly` cookies required a deep understanding of token security, cookie management, and protection against XSS and CSRF attacks (with CSRF tokens, if implemented). Ensuring the token was correctly sent and validated on all protected requests was a key point.
* **Role-Based Access Control (RBAC):** Developing backend middleware to protect routes based on user roles (`admin`, `employee`) while simultaneously adapting the frontend UI to display specific functionalities for each user type.
* **Complex State Management in React:** Handling authentication state (logged-in user, authentication status) and data loading/errors globally using the Context API to avoid "prop drilling" and centralize authentication logic.
* **API Consumption and Error Handling:** Creating a services layer in the frontend (`clientService.js`, `appointmentService.js`) to abstract Axios calls and consistently handle API responses and errors.
* **Date and Time Management:** Working with timezones, date formatting, and time validation for appointments in a full-stack environment.

## 🚀 How to Run the Project Locally

### Prerequisites

* Node.js (v18 or higher recommended)
* npm or Yarn
* MongoDB (local instance or via MongoDB Atlas)

### Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Yago-Brum/appointment_crm_nodejs.git](https://github.com/Yago-Brum/appointment_crm_nodejs.git)
    cd appointment_crm_nodejs
    ```

2.  **Configure the Backend:**
    * Navigate to the `server` directory:
        ```bash
        cd server
        ```
    * Install dependencies:
        ```bash
        npm install
        # or yarn
        ```
    * Create a `.env` file in the root of the `server` directory and add your environment variables:
        ```env
        NODE_ENV=development
        PORT=5000
        MONGO_URI=mongodb://localhost:27017/appointmentcrm # Or your MongoDB Atlas string
        JWT_SECRET=your_long_and_secure_jwt_secret_key
        JWT_COOKIE_EXPIRE=30d # Example: 30 days
        # CORS_ORIGIN=http://localhost:3000 # If necessary to configure, but '*' is usually sufficient for dev
        ```
    * Start the backend server:
        ```bash
        npm start
        # or with nodemon for development: npm run dev
        ```
    * The backend will be running on `http://localhost:5000`.

3.  **Configure the Frontend:**
    * Navigate back to the project's root directory (where the frontend `package.json` is located):
        ```bash
        cd ..
        ```
    * Install dependencies:
        ```bash
        npm install
        # or yarn
        ```
    * Create a `.env` file in the root of the frontend directory and add your environment variable:
        ```env
        REACT_APP_API_URL=http://localhost:5000/api
        ```
    * Start the React application:
        ```bash
        npm start
        # or yarn start
        ```
    * The frontend application will be running on `http://localhost:3000`.

## 🖥️ Usage

1.  Access `http://localhost:3000` in your browser.
2.  **Register** as a new user (create a user with `role: admin` directly in MongoDB to test admin functionalities if needed, or implement an admin registration endpoint).
3.  **Log in** with your credentials.
4.  Navigate through the Dashboard, Clients, and Appointments to manage your data.
5.  Use the **Logout** function to end the session.

---

## 👨‍💻 Author

Yago Brum

[Your LinkedIn](https://www.linkedin.com/in/yago-brum/)

[Your GitHub](https://github.com/Yago-Brum)

---
