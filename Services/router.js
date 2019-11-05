const ServiceName = "service-router";
var amqp = require("amqplib/callback_api");

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

    var baseQueue = "get_everything_from_api";

    const parallelQueues = ["get_account_data"];

    channel.assertQueue(baseQueue, {
      durable: false
    });

    channel.prefetch(1);

    console.log(
      `[*] Waiting for messages in ${baseQueue}. To exit press CTRL+C`
    );

    channel.consume(baseQueue, function(msg) {
      apm.startTransaction("Route Event", "Event Received", {
        startTime: Date.now()
      });

      parallelQueues.forEach(queue => {
        channel.sendToQueue(queue, msg.content);
      });

      channel.ack(msg);

      apm.endTransaction("success", Date.now());
      console.log(" [x] Received %s", msg.content.toString());
    });
  });
});
