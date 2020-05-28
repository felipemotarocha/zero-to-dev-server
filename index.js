const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Initializing Express
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Initializing Server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}!`));
