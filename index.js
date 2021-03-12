/*
Copyright (C) 2021  Stefan Begerad

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
require('dotenv').config();
const request = require('request');
const debug=require('debug')('gtfs-rt-get2mongo')
const mongoose = require('./mongooseConnect')
const Location=require('./models/location.js')

const URL=process.env.URL||'https://dedriver.org/gtfs-rt/vehiclePositions.pb';
debug('URL: '+URL)

const UUID_PREFIX=process.env.UUID_PREFIX||'deu-dede';
debug('UUID_PREFIX: '+UUID_PREFIX)

const REQUEST_CYCLE=parseInt(process.env.REQUEST_CYCLE, 10)||30000;
debug('REQUEST_CYCLE: '+REQUEST_CYCLE)

const TS_FACTOR=parseInt(process.env.TS_FACTOR, 10)||30000;
debug('TS_FACTOR: '+TS_FACTOR)

//TODO vehicle code 0 is not supported by js library dotenv!!!
const VEHICLE=parseInt(process.env.VEHICLE, 10)||0;
debug('VEHICLE: '+VEHICLE)

const TOKEN=process.env.TOKEN||'TOKEN';
debug('TOKEN: '+TOKEN)

const requestSettings = {
    method: 'GET',
    url:URL,
    encoding: null,
    headers:{
	'authorization':`${TOKEN}`
    }
};

const db=mongoose.connection
db.once('open', _ => {
    debug('Database connected')
})
db.on('error', err => {
    console.error('connection error:', err)
})

var ERROR=false;

//buffer unknown vehicles in array to insert later alltogether
var saveArray=[]

run().catch(err => {
    debug('...run error')
    debug(err)
    ERROR=true;
});

async function run() {

    //update database with unknown documents
    if(saveArray.length>0){

	Location.insertMany(saveArray, function(err) {
		if(err){
		    debug('insertMany: err: '+err)
		    return
		}else{
		    saveArray=[]
		}
	    });
    }else{

	//request document updates
	request(requestSettings, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
		var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);

		//search response for known documents and update
		feed.entity.forEach(function(entity) {
		//create new model instance == location document
		let loc = new Location()

		if (entity.trip_update) {
		    debug('trip update')
		}else if(entity.vehicle){

		    //create model instance (document) based on req body
		    createLocation(entity,loc)

		    //debug('new loc: %s',loc);
		    const filter={uuid:loc.uuid}
		    const update={
			uuid:loc.uuid,
			lat:loc.lat,
			lon:loc.lon,
			ts:loc.ts,
			alias:loc.alias,
			vehicle:loc.vehicle,
			label:loc.label,
			licensePlate:loc.licensePlate
		    }

		    Location.findOneAndUpdate(
			filter,
			update,
			{returnOriginal:false},
			function (err, docs)
			{
			    if (err){
				debug(err)
			    }
			    else{
				if(!docs){
				    saveArray.push(loc)
				}
			    }
			});

		}else if(entity.alert){
		    debug('alert')
		}else{
                    debug('entity unknown')
		}
            });

	}else{
	    debug('error or unsatisfactory status code: '+response.statusCode)
	}
    });
    }

    //stop interval if error occurs
    if (ERROR) {
        debug('run exiting');
	clearInterval(this);
    }
}
//call callback function every interval
setInterval(run, REQUEST_CYCLE);

function createLocation(entity,loc){
    loc.vehicle=VEHICLE
    const vehicle=entity.vehicle
    if(vehicle.vehicle){
	const vehDes=vehicle.vehicle
	if(vehDes.id){
	    debug('id: %s',vehDes.id)
	    loc.uuid=UUID_PREFIX+vehDes.id
	    debug('loc.uuid: %s',loc.uuid)
	}else{
	    debug('id unavailable')
	}
	if(vehDes.label){
	    debug('label: %s',vehDes.label)
	    loc.label=vehDes.label
	    loc.alias=vehDes.label
	}else{
	    debug('label unavailable')
	}
	if(vehDes.licensePlate){
	    debug('licensePlate: %s',vehDes.licensePlate)
	    loc.licensePlate=vehDes.licensePlate
	}else{
	    debug('licensePlate unavailable')
	}
    }else{
	debug('vehicle unavailable')
    }
    if(vehicle.position){
	const position=vehicle.position
	if(position.latitude){
	    const latitude=position.latitude
	    debug('latitude: %s',latitude)
	    loc.lat=latitude
	}else{
	    debug('latitude unavailable')
	}
	if(position.longitude){
	    const longitude=position.longitude
	    debug('longitude: %s',longitude)
	    loc.lon=longitude
	}else{
	    debug('longitude unavailable')
	}
    }else{
	debug('position unavailable')
    }
    if(vehicle.timestamp){
	debug('timestamp: %s',vehicle.timestamp)
	loc.ts=vehicle.timestamp*TS_FACTOR
    }else{
	debug('timestamp unavailable')
    }
}

