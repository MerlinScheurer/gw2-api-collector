const ServiceName = "service-characters";

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

amqp.connect("amqp://localhost", function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }

    const queue = "get_character_data";

    const nextQueues = [
      "get_equipment_data_for",
      "get_inventory_data_for",
      "get_core_data_for",
      "get_skills_data_for"
    ];

    channel.assertQueue(queue, {
      durable: false
    });

    channel.prefetch(1);

    console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);

    channel.consume(queue, function(msg) {
      const { accessToken, tracer } = JSON.parse(msg.content.toString());

      apm.startTransaction("Get /v2/characters from API", "Event Received", {
        startTime: Date.now(),
        childOf: tracer
      });

      console.log(` [x] Received Characters Request for ${accessToken}`);

      fetch(
        `https://api.guildwars2.com/v2/characters?accessToken=${accessToken}`
      )
        .then(data => data.json())
        .then(async characters => {
          client.update(
            {
              index: index,
              id: accessToken,
              body: {
                doc: {
                  characters: {}
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

              characters.forEach(char => {
                let data = {
                  accessToken,
                  character: char,
                  tracer: apm.currentTraceparent
                };

                nextQueues.forEach(queue => {
                  channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
                });
              });

              apm.endTransaction("Success", Date.now());

              console.log(` [x] Success Characters for ${accessToken}`);
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
