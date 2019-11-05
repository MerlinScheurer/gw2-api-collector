const ServiceName = "service-account";

var amqp = require("amqplib/callback_api");
var fetch = require("node-fetch");
var elasticsearch = require("@elastic/elasticsearch");

var apm = require("elastic-apm-node").start({
  serviceName: ServiceName,
  secretToken: "<apm_token>",
  serverUrl: "http://localhost:8200/"
});

var client = new elasticsearch.Client({
  nodes: ["http://localhost:9200/"]
});

const index = "gw2-accounts";
const serviceEndpoint = ServiceName.split("-").pop();

// Make sure the Index gw2-accounts is set up
client.indices.create(
  {
    index: index
  },
  function(err, resp, status) {
    if (err) {
      console.log("elk ERROR: ", err);
      return;
    }
    console.log("indices.create created");
  }
);

amqp.connect("amqp://localhost", function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    var queue = `get_${serviceEndpoint}_data`;
    var characterData = "get_character_data";

    channel.assertQueue(queue, {
      durable: false
    });

    channel.prefetch(1);

    console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);

    channel.consume(queue, function(msg) {
      const { accessToken, tracer } = JSON.parse(msg.content.toString());

      apm.startTransaction(
        `Get /v2/${serviceEndpoint} from API`,
        "Event Received",
        {
          startTime: Date.now(),
          childOf: tracer
        }
      );

      console.log(
        ` [x] Received ${serviceEndpoint} Request for ${accessToken}`
      );

      fetch(
        `https://api.guildwars2.com/v2/${serviceEndpoint}?accessToken=${accessToken}`
      )
        .then(data => data.json())
        .then(result => {
          client.index(
            {
              index: index,
              id: accessToken,
              body: { ...result, updated: new Date(), characters: {} }
            },
            function(err, resp, status) {
              if (err) {
                channel.nack(msg);
                apm.endTransaction("Error", Date.now());
                apm.captureError(err, {
                  timestamp: Date.now(),
                  message: "Elasticsearch Error"
                });
                return;
              }

              let data = { accessToken, tracer: apm.currentTraceparent };

              channel.sendToQueue(
                characterData,
                Buffer.from(JSON.stringify(data))
              );

              channel.ack(msg);
              apm.endTransaction("Success", Date.now());
              console.log(` [x] Success ${serviceEndpoint} for ${accessToken}`);
            }
          );
        })
        .catch(err => {
          channel.nack(msg);
          apm.endTransaction("Error", Date.now());
        });
    });
  });
});
