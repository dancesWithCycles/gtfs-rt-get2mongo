# Gtfs-rt-get2mongo

translate a GTFS-Realtime feed from HTTP GET request to MongoDb

## Table of Contents
0. [General](#General)
1. [Quick Start Guide](#Quick-Start-Guide)
2. [Setup](doc/setup.md)

# General

This repository provides a command line interface service for Linux based operating systems. As a back end service it interacts between GTFS-Realtime feed providers and the Designated Driver (Dede) [initiative](https://dedriver.org).

# Quick Start Guide

## Preparation

* checkout the git repository\
```
git clone https://github.com/dancesWithCycles/gtfs-rt-get2mongo.git
```

* change into the project directory\
```
cd gtfs-rt-get2mongo
```

* checkout git repository ```dede-mongo``` into project directory to interact with Dede database\
```
git clone https://github.com/dancesWithCycles/dede-mongo.git
```

* run the following command in your favorite GNU/Linux shell to install dependenies\
```
npm i
```

## Development setup

* run the following command in your favorite GNU/Linux shell if you fancy log messages for debugging\
```
export DEBUG=gtfs-rt-get2mongo,mongoose,$DEBUG
```

* run the following command in your favorite GNU/Linux shell to start the service\
```
npm run dev
```

## Production deployment

* run the following instrction to start the service for production mode.
```
npm run start
```
