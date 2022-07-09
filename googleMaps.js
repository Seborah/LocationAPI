require("dotenv").config()
const fs = require("fs")
var googlemaps = require("@googlemaps/google-maps-services-js")
var { findSpiralOnLongitude, findNextIndex } = require("./math")
var config = require("./config.json")


/**
 *
 * @param {String} address
 * @returns {googlemaps.GeocodeResponse} place data
 */
async function getCityCoordinates(address) {
	var out = await this.c.geocode({
		params: {
			address: address,
			key: process.env.GCPKEY,
		},
	})
	return out
}

/**
 * returns a list of locations near the given address in distance order
 * @param {String} address
 * @returns {googlemaps.PlacesNearbyResponse} nearby locations
 */
async function getNearbyLocations(address) {
	var location = (await this.getCityCoordinates(address)).data.results[0].geometry.location
	var out = await this.c.placesNearby({
		params: {
			location: location,
			type: config.type,
			keyword: config.keywords.join(" "),
			rankby: "distance",
			key: process.env.GCPKEY,
		},
	})
	out.extra = location
	return out
}

/**
 * 
 * @param {String} address 
 * @returns {Object} city and locations
 */
async function getLocationsAndCity(address) {
	var temp = await this.getNearbyLocations(address)
	var cityObject = {
		spiralID: findNextIndex(...findSpiralOnLongitude(temp.extra.lat, temp.extra.lng)),
		locations: [],
	}

	var locationArray = []
    if (false) {
		locationArray = database.get(cityObject.spiralID)
	} else {
		for (var i = 0; i < temp.data.results.length; i++) {
			var location = temp.data.results[i]
			var address = location.vicinity
			var name = location.name
			var second = await this.c.placeDetails({
				params: {
					key: process.env.GCPKEY,
					place_id: location.place_id,
					fields: "formatted_phone_number,website,url",
				},
			})
			cityObject.locations.push(temp.data.results[i].place_id)
			locationArray.push({
				name: name,
				address: address,
				phone: second.data.result.formatted_phone_number,
				website: second.data.result.website,
				placeID: temp.data.results[i].place_id,
				url: second.data.result.url,
				lat: location.geometry.location.lat,
				lng: location.geometry.location.lng,
			})
		}
	}
	var finalObject = {
		city: cityObject,
		locations: locationArray,
	}
	fs.writeFileSync(address + ".json", JSON.stringify(finalObject, null, 4))
	return finalObject
}

class maps {
    constructor() {
        this.c = new googlemaps.Client({})
        this.getLocationsAndCity = getLocationsAndCity
        this.getCityCoordinates = getCityCoordinates
        this.getNearbyLocations = getNearbyLocations
        
    }
}

module.exports = { maps }
