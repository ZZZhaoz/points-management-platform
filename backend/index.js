#!/usr/bin/env node
'use strict';

require('dotenv').config();  

const express = require("express");
const app = express();


// ADD YOUR WORK HERE
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());

const port = process.env.PORT || 8000;

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000',   // React dev server
    credentials: true,                 // Allow cookies
}));

const routes = require("./src/routes");
app.use("/", routes);


const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});