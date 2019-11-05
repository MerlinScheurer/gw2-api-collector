# gw2-api-collector

Worker based api dumping tool for the Guild Wars 2 [api v2](https://api.guildwars2.com/v2).

If you want to get all the data from the Guild Wars 2 api you might be better of using the [gw2api-client](https://github.com/queicherius/gw2api-client)

## Setup

### Required Software

- Docker
- docker-compose
- Nodejs

Clone this repository:

    git clone https://github.com/MerlinScheurer/gw2-api-collector.git

Install dependencies

    npm install && docker-compose pull

## Usage

Start Docker containers

    docker-compose up -d

Start the services

    pm2 start

Monitor processes

    pm2 monit

## Services

The gw2-api-collector accepts `http://localhost:3000/?accessToken=<AccessToken>`

You get your AcessToken from [Arena.net](https://account.arena.net/applications)

| Service           | Adress                  |
| ----------------- | ----------------------- |
| gw2-api-collector | http://localhost:3000/  |
| RabbitMQ          | http://localhost:15672/ |
| Elasticsearch     | http://localhost:5601/  |

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Merlin Scheurer](https://merlinscheurer.de/)

MIT License, see the included [License.md](License.md) file.
