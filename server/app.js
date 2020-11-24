const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const models = require("./models/models.js")(mongoose);
const multer = require("multer");
const fs = require("fs");
const dontenv = require("dotenv").config();
const baseUrl = process.env.BASE_URL;
const port = process.env.PORT;
const databaseUrl = process.env.DATABASE_URL;
app.use(cors({origin: "*"}));
app.use(express.json());

const songs = require("./routes/songs.js")(app, models, multer, fs);

mongoose.connect(databaseUrl, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
const database = mongoose.connection;
database.on("error", function(error) {
    console.log("Connection to the database has not been established!");
    console.log(error);
});
database.on("open", function() {
    console.log("Connection to the database has been successfully established!");
});

app.listen(port, function() {
    console.log("Tasks app listening on " + baseUrl + port + "!");
});