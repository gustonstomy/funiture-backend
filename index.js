// server/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dotenv from "dotenv";
import bodyParser from "body-parser";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

// Import routes
app.use("/api/tasks", taskRoutes);
app.use("/api/user", userRoutes);

app.get("/", [], (req, res) => {
  res.send("Hello world!");
});
app.post("/", (req, res) => {
  res.send("Hello world!");
  console.log("req", req.body);
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));

export default app;
// This code sets up an Express.js server that connects to a MongoDB database.
//  It uses the dotenv package to load environment variables from a .env file,
//  and the cors package to enable Cross-Origin Resource Sharing. The server
// listens on a specified port (defaulting to 5000) and uses JSON middleware
// to parse incoming requests. It also imports and uses task routes for handling task-related API requests.
// The server connects to the MongoDB database using the connection string
// stored in the MONGO_URI environment variable. If the connection is successful,
//  it starts the server and logs a message indicating that it's running.
//  If there's an error connecting to the database, it logs the error to the console.
//
// This code is a basic setup for a task management API using Node.js, Express, and MongoDB.
//  It provides a foundation for building a full-stack application where users can create, read, update, and delete tasks.
// The server is structured to allow for easy expansion, such as adding authentication,
//  more complex business logic, or additional routes in the future. The use of environment
// variables for sensitive information like the MongoDB connection string is a good practice for security and flexibility.
// The code is modular, separating concerns by having different files for models, controllers, and routes.
//  This makes it easier to maintain and understand the codebase as it grows.
// The server is designed to be RESTful, following standard conventions for API design. This means that the routes
//  are structured in a way that makes sense for the resources they represent (in this case, tasks).
// The use of async/await for handling asynchronous operations (like database queries) makes the code cleaner and easier
// to read compared to traditional callback-based approaches.
// Overall, this code provides a solid foundation for a task management application, demonstrating best practices in Node.js
// development, including modularity, use of environment variables, and RESTful API design.
