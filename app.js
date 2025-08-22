// server/app.js

require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // To read JWT cookies

// Import database connection function
const connectDB = require("./frontend/config/db");

// Import route files
const authRoutes = require("./frontend/routes/authRoutes");
const userRoutes = require("./frontend/routes/userRoutes");
const clientRoutes = require("./frontend/routes/clientRoutes");
const appointmentRoutes = require("./frontend/routes/appointmentRoutes");

// Import custom middlewares
const errorHandler = require("./frontend/middleware/errorMiddleware"); // Global error handling middleware

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middlewares
app.use(express.json()); // Allows Express to parse JSON in request bodies
app.use(cookieParser()); // Enables cookie parsing
app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your frontend URL in development
    credentials: true, // Allows cookies to be sent with requests
  })
);

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/appointments", appointmentRoutes);

// Custom error handling middleware (MUST BE THE LAST MIDDLEWARE!)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
