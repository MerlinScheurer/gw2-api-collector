const ServiceName = "service-initiator";

var amqp = require("amqplib/callback_api");
var express = require("express");
var app = express();

var apm = require("elastic-apm-node").start({
  serviceName: ServiceName,
  secretToken: "<apm_token>",
  serverUrl: "http://localhost:8200/"
});

amqp.connect("amqp://localhost", function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    var queue = "get_everything_from_api";

    channel.assertQueue(queue, {
      durable: false
    });

    app.get("/", function(req, res) {
      const accessToken = req.query.accessToken;
      if (!accessToken) {
        res.status(400).send("Please define a accessToken inside the url");
        return;
      }

      apm.startTransaction(
        `API / Load Data for ${accessToken}`,
        "GET Received",
        {
          startTime: Date.now()
        }
      );
      apm.setCustomContext({ accessToken });

      let data = { accessToken, tracer: apm.currentTraceparent };

      channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));

      apm.endTransaction("success", Date.now());

      res.send(`[x] request data from token: ${accessToken}`);
    });
  });
});

app.listen(3000, function() {
  console.log("Example app listening on port 3000!");
});
