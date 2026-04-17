const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();

// basic body parsers (safe if already used elsewhere)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // <-- required for refresh token cookie handling

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = app;