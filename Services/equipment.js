const ServiceName = "service-equipment";

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

amqp.connect("amqp://localhost", function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    var queue = `get_${serviceEndpoint}_data_for`;

    channel.assertQueue(queue, {
      durable: false
    });

    channel.prefetch(1);

    console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);

    channel.consume(queue, function(msg) {
      const { accessToken, character, tracer } = JSON.parse(
        msg.content.toString()
      );

      apm.startTransaction(
        `Get /v2/characters/${character}/${serviceEndpoint} from API`,
        "Event Received",
        {
          startTime: Date.now(),
          childOf: tracer
        }
      );

      console.log(` [x] Received Characters Request for ${accessToken}`);

      fetch(
        `https://api.guildwars2.com/v2/characters/${character}/${serviceEndpoint}?accessToken=${accessToken}`
      )
        .then(data => data.json())
        .then(async result => {
          client.update(
            {
              index: index,
              id: accessToken,
              refresh: "true",
              body: {
                doc: {
                  characters: {
                    [character]: {
                      [serviceEndpoint]: result
                    }
                  }
                }
              }
            },
            function(err, resp, status) {
              if (err) {
                console.log("elk ERROR: ", err);
                channel.nack(msg);
                apm.endTransaction("Error", Date.now());
                return;
              }

              channel.ack(msg);
              apm.endTransaction("Success", Date.now());
              console.log(
                ` [x] Success ${serviceEndpoint} for ${character} - ${accessToken}`
              );
            }
          );
        })
        .catch(err => {
          console.log(err);
          channel.nack(msg);
          apm.endTransaction("Error", Date.now());
        });
    });
  });
});
