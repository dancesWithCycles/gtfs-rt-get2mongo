# gtfs-rt-get2mongo
translate a GTFS-Realtime message feed from HTTP GET request to a mongo db

## Overview
This repository provides a command line interface service for Linux based operating system. As a back end service it interacts between GTFS-Realtime message feed providers and the Dede database.

## Setup for development environment
Run the following command in your favorite GNU/Linux shell to install dependenies.
```
npm i
```
Run the following command in your favorite GNU/Linux shell if you fancy log messages for debugging.
```
export DEBUG=$DEBUG,gtfs-rt-get2mongo,mongoose
```
Run the following command in your favorite GNU/Linux shell to start the service.
```
npm run dev
