const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const bcrypt = require('bcrypt');
const EmployeeModel = require('./models/Employee');
const app = express();

// CORS configuration
app.use(cors({
    origin: ["https://login-frontend-virid.vercel.app/"],  // Allow your frontend domain
    methods: ["POST", "GET", "OPTIONS"],  // Allow POST, GET, and OPTIONS (preflight request)
    allowedHeaders: ["Content-Type", "Authorization"],  // Allow specific headers
    credentials: true  // Enable cookies or authentication headers
}));

app.use(express.json());

// MongoDB connection
async function connectDB() {
    try {
        await mongoose.connect("mongodb+srv://login:login123@cluster0.izd3s.mongodb.net/login");
        console.log("Connected to MongoDB Atlas");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}

connectDB();

// Basic test route
app.get("/", (req, res) => {
    res.json("Hello, backend is working!");
});

// Login route
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    EmployeeModel.findOne({ email: email })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        res.status(500).json({ message: "Error comparing passwords", error: err });
                    } else if (result) {
                        res.json("Success");
                    } else {
                        res.json("The password is incorrect");
                    }
                });
            } else {
                res.json("No record found for this email");
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Error during login", error: err });
        });
});

// Register route (with password hashing)
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
        const newEmployee = new EmployeeModel({
            name,
            email,
            password: hashedPassword
        });

        await newEmployee.save();
        res.json({ message: "Employee registered successfully", employee: newEmployee });
    } catch (err) {
        res.status(500).json({ message: "Error registering employee", error: err });
    }
});

// Server start
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
