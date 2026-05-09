const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/users", require("./routes/users"));

app.get("/", (req, res) => res.json({ message: "Team Task Manager API running" }));

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(process.env.PORT || 5000, () =>
            console.log(`Server running on port ${process.env.PORT || 5000}`)
        );
    })
    .catch((err) => console.error("DB connection error:", err));