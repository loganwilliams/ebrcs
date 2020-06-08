const express = require("express");
const app = express();
const port = 4321;
const axios = require("axios");
require("dotenv").config();
require("express-ws")(app);

app.ws("/new", function (ws, req) {
  ws.on("message", function (msg) {
    msg = JSON.parse(msg);

    if (msg.type === "call_end") {
      let call = {
        talkgroup: msg.call.talkgroup,
        tgtag: msg.call.talkgrouptag,
        start_time: new Date(parseInt(msg.call.startTime) * 1000),
        stop_time: new Date(parseInt(msg.call.stopTime) * 1000),
        length: parseFloat(msg.call.length),
        encrypted: msg.call.encrypted === "true",
        filename: msg.call.filename,
      };

      if (call.length > 0.1 && call.length < 1000) {
        console.log(call);

        axios
          .post("http://api.ebrcs.live/call", {
            ...call,
            key: process.env.KEY,
          })
          .then((res) => {
            console.log(`statusCode: ${res.status}`);
          })
          .catch((error) => {
            // console.log(error);
          });
      }
    } else if (msg.type === "call_start") {
      if (msg.call.encrypted === "true") {
        let call = {
          talkgroup: msg.call.talkgroup,
          tgtag: msg.call.talkgrouptag,
          start_time: new Date(parseInt(msg.call.startTime) * 1000),
          stop_time: new Date((parseInt(msg.call.stopTime) + 5) * 1000),
          length: 5,
          encrypted: msg.call.encrypted === "true",
          filename: "na",
        };

        console.log(call);

        axios
          .post("http://api.ebrcs.live/call", {
            ...call,
            key: process.env.KEY,
          })
          .then((res) => {
            console.log(`statusCode: ${res.status}`);
          })
          .catch((error) => {
            // console.log(error);
          });
      }
    }
  });
});

app.get("/", (req, res) => res.send("trunk-recorder-listener"));

app.listen(port, () =>
  console.log(
    `Listening for trunk-recorder messages at http://localhost:${port}`
  )
);
