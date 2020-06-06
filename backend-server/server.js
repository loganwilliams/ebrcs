const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const db = require("./queries");
const port = 3000;
var cors = require('cors')

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.json({ info: "API" });
});

app.post("/call", db.addCall);
app.get("/calls", cors(), db.getCalls);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
