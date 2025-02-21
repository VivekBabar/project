const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Serves static files from "public"
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/userDataDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// Routes

// Signup Route
app.post("/signup", async (req, res) => {
  const { name, password } = req.body;
  try {
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.send("User already exists! <a href='/signup'>Try Again</a>");
    }
    const newUser = new User({ name, password });
    await newUser.save();
    res.send("Signup successful! <a href='/'>Login Here</a>");
  } catch (error) {
    res.status(500).send("Error during signup.");
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ name, password });
    if (user) {
      req.session.user = user; 
      res.redirect("/dashboard");
    } else {
      res.send("Invalid Username or Password. <a href='/login'>Try Again</a>");
    }
  } catch (error) {
    res.status(500).send("Error processing request.");
  }
});

// Dashboard Route (Protected)
app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Serve Static HTML Pages
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/book", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "book.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
