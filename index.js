const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Loading environment variables and database
require("dotenv").config();
require("./db/mongoose");

// Initializing Express
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Routes
const topicsRouter = require("./routes/topic/topic.routes");
app.use("/api/topics", topicsRouter);

const videosRouter = require("./routes/video/video.routes");
app.use("/api/videos", videosRouter);

const usersRouter = require("./routes/user/user.routes");
app.use("/api/users", usersRouter);

// Initializing Server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}!`));
