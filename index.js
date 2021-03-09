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
      
const requestSettings = {
    method: 'GET',
    url:URL,
    encoding: null
};

const db=mongoose.connection
db.once('open', _ => {
    debug('Database connected')
})
db.on('error', err => {
    console.error('connection error:', err)
})

const ERROR=false;

run().catch(err => {
    debug('...run error')
    console.log(err)
    ERROR=true;
});

async function run() {
    debug('run...')

    request(requestSettings, function (error, response, body) {
	if (!error && response.statusCode == 200) {
	    debug('response 200');

            var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
	    debug('feed decoded')

	    //create new Location instance based on request
	    let loc = new Location()
	    initLocation(loc)
	    //debug('new loc: %s',loc);
	
            feed.entity.forEach(function(entity) {
		if (entity.trip_update) {
		    debug('trip update')
		}else if(entity.vehicle){

		    createLocation(entity,loc)
		    //debug('new loc: %s',loc);

		    //check database for existing locations
		    findLocation(loc);

		}else if(entity.alert){
		    debug('alert')
		}else{
                    debug('entity unknown')
		}
            });
	}else{
	    debug('error or unsatisfactory status code')
	}

	//stop interval if error occurs
        if (ERROR) { 
            debug('run exiting'); 
            clearInterval(this); 
        }
    });
}

//call callback function every interval
setInterval(run, 10000);


function initLocation(loc){
    //debug('initLocation...')

    	loc.uuid=''
	loc.lat=0;
	loc.lon=0;
	loc.ts=0;
	loc.alias=''
	loc.vehicle=''
	loc.label=''
	loc.licensePlate=''


    //debug('initLocation done.')
}

function createLocation(entity,loc){
    //debug('createLocation...')

                debug('vehicle position')

		const vehicle=entity.vehicle
		if(vehicle.vehicle){
		    debug('vehicle')
		    const vehDes=vehicle.vehicle
		    if(vehDes.id){
			debug('id: %s',vehDes.id)
			loc.uuid=vehDes.id
		    }else{
			debug('id unavailable')
		    }
		    if(vehDes.label){
			debug('label: %s',vehDes.label)
			loc.label=vehDes.label
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
		    debug('position')
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
		    loc.ts=vehicle.timestamp
		}else{
		    debug('timestamp unavailable')
		}

    
    //debug('createLocation done.')
}

function updateLocation(locA,locB){
    locA.lat=locB.lat
    locA.lon=locB.lon
    locA.ts=locB.ts
    locA.alias=locB.alias
    locA.vehicle=locB.vehicle
    locA.label=locB.label
    locA.licensePlate=locB.licensePlate
}    

function saveLocation(loc){
    loc.save(function(err, location) {
        if(err){
	    debug('save error:'+err)
	}
    });
}

function findLocation(locNew){
    debug('find location for uuid %s',locNew.uuid);

    //check database for existing locations
    Location.findOne({uuid:locNew.uuid}, function(err, location){
	if(err){
	    debug('find location error: '+err)
	}
	else if(location){
	    //update existing location
	    updateLocation(location,locNew)
	    saveLocation(location)
	}else{
	    //save new location
	    saveLocation(locNew)
	}
    });
}

