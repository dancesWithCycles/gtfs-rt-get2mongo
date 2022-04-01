# Gtfs-rt-get2mongo

use the following checklist to setup this service

## Preparation

* check out git repositories onto a development system as descirpted in the
[Quick Start Guide](../README.md#Quick-Start-Guide)
but do not run ```npm i```

* archive project and copy onto host system
```
cd ..
tar -czvf gtfs-rt2mongo.tar.gz --exclude={"gtfs-rt-get2mongo/.git","gtfs-rt-get2mongo/dede-mongo/.git"} gtfs-rt-get2mongo/
scp -P <host ssh port> gtfs-rt2mongo.tar.gz  <user>@<host>.<domain>:/home/<user>/
```

* [Setup Node.js and NPM](https://github.com/Software-Ingenieur-Begerad/setup/blob/main/doc/setup-npm.md)

* install MongoDB dependencies
```
sudo apt install dirmngr gnupg apt-transport-https software-properties-common ca-certificates curl --no-install-recommends
```

* install MongoDB GPG key
```
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
```

* add MongoDB repository to apt sources list
```
echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/5.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
```
NOTE: If you noticed the command had Buster instead of Bullseye, do not panic, the MongoDB Community Edition does not have a separate repository for Debian Bullseye. However, the continued work and development in Buster works and is compatible.

* install MongoDB
```
sudo apt-get update
sudo apt install mongodb-org --no-install-recommends
```

* start and activate MondoDB
```
sudo systemctl enable mongod --now
```

* verify installation
```
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
systemctl status mongod
```

## Automatic Service Setup For Production

* create folder for deployment
```
sudo mkdir -p /opt/gtfs-rt2mongo-<feed>
```

* copy service source into the working folder
```
sudo tar -xzf ~/gtfs-rt2mongo.tar.gz -C /opt/gtfs-rt2mongo-<feed> --strip 1
```

* set up service environment on host system
```
cd /opt/gtfs-rt2mongo-<feed>
sudo vi .env
MONGOOSE_DEBUGGING=<define debugging config (true/false)>
MONGOOSE_DEBUG=<define debugging config (true/false)>
MONGOOSE_DB=<define database name>
MONGOOSE_PORT=<define database port (default: 27017)>
MONGOOSE_HOST=<deinfe database host (default: 127.0.0.1)>
MONGOOSE_UP=
MONGOOSE_TYPE=mongodb://
PORT=<define service port>
NODE_ENV=production
URL=<GTFS-RT feet address>
REQUEST_CYCLE=<HTTP GET request cycle in milliseconds (default: 30000)>
UUID_PREFIX=<GTFS-RT feed country code and transit authority as unique id (default: deu-de)>
TS_FACTOR=<timestamp factor (default: 30000)>
VEHICLE=<vehicle code (default: 0)>
TOKEN=<API token (default: TOKEN)>
```

* create group and user <service name>
following this [setup](https://github.com/Software-Ingenieur-Begerad/setup/blob/main/doc/grp-usr.md)

* adjust group and user privileges
```
sudo chown -R <service name>:<service name> /opt/gtfs-rt2mongo-<feed>
```

* prepare pm2 following this [setup](https://github.com/Software-Ingenieur-Begerad/setup/blob/main/doc/pm2.md)

* start the service as npm start script with PM2
```
cd /opt/gtfs-rt2mongo-<feed>
pm2 start --name gtfs-rt2mongo-<feed> npm -- start --watch
```

* register/save the current list of processes you want to manage using PM2 so that they will re-spawn at system boot (every time it is expected or an unexpected server restart)
```
pm2 save
```

* restart your system, and check if all the serviceis running under PM2
```
pm2 ls
```
or
```
pm2 status
```

## Manual Service Invocation For Development
* call service manually
```
npm i
export DEBUG=<check repo>
npm run dev
```
