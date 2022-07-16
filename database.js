var express = require("express")
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
var mysql = require("mysql")
var config = require("./config.json")

const onlyLettersPattern = /^[a-zA-Z\s]*$/

var { maps } = require("./googleMaps")
var { findSpiralOnLongitude, findNextIndex } = require("./math")

const pool = mysql.createPool({
	host: config.db.host,
	user: config.db.user,
	password: process.env.DBPASSWORD,
	connectionLimit: 10,
	database: config.db.database,
	multipleStatements: false,
})

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns
 */
async function getCityByName(req, res) {
	if (!req.query.name) {
		return res.status(400).json({ err: "No name provided" })
	}
	if (!req.query.name.match(onlyLettersPattern)) {
		return res.status(400).json({ err: "No special characters and no numbers, please!" })
	}

	var c = new maps()
	try {
		var cityCoords = (await c.getCityCoordinates(req.query.name)).data.results[0].geometry.location
		var spiralID = findNextIndex(...findSpiralOnLongitude(cityCoords.lat, cityCoords.lng))
	} catch (e) {
		res.status(500).send("Error")
		console.log(e)
		return
	}

	pool.getConnection(async (err, connection) => {
		if (err) {
			console.log(err)
			res.status(500).send("Error")
		}
		connection.query(config.querries.cities, [spiralID], async (err, rows) => {
			if (err) {
				console.log(err)
				res.sendStatus(400).send("Error")
				return
			}

			if (rows.length === 0) {
				console.log("gcp")
				try {
					var data = await c.getLocationsAndCity(null, spiralID, cityCoords)
				} catch (e) {
					console.log(e)
					res.status(500).send("Error")
					return
				}
				//insert new city into database

				var placeIDS = []
				data.locations.forEach((location) => {
					placeIDS.push(location.placeID)
				})
				connection.query(config.querries.newcity, [spiralID, cityCoords.lat, cityCoords.lng, JSON.stringify(placeIDS)], (err, result) => {
					if (err) {
						console.log(err)
						res.status(500).send("Error")
						return
					}
				})
				for (let i = 0; i < data.locations.length; i++) {
					connection.query(
						config.querries.newlocation,
						[
							data.locations[i].placeID,
							data.locations[i].name,
							data.locations[i].address,
							data.locations[i].lat,
							data.locations[i].lng,
							data.locations[i].phone,
							" ",
							data.locations[i].website,
							data.locations[i].url,
						],
						(err, result) => {
							if (err) {
								console.log(err)
								res.status(500).send("Error")
								return
							}
						}
					)
				}
				getEmails(data)
				res.json(data)
			} else {
				var places = await JSON.parse(rows[0].extra)

				var finalObject = { locations: [] }
				finalObject.city = { spiralID: rows[0]["spiral_id"], locations: places }
				for (let i = 0; i < places.length; i++) {
					connection.query(config.querries.locations, [places[i]], (err, result) => {
						if (err) {
							console.log(err)
							res.status(500).send("Error")
							return
						}

						finalObject.locations.push({
							name: result[0].name,
							address: result[0].address,
							phone: result[0]["phone_number"],
							website: result[0].website,
							placeID: result[0]["place_id"],
							url: result[0].extra,
							lat: result[0].latitude,
							lng: result[0].longitude,
						})
						if (i === places.length - 1) {
							res.json(finalObject)
						}
					})
				}
			}

			connection.release()
		})
	})
}

async function updateLocation(placeID, emails) {
	pool.getConnection(async (err, connection) => {
		if (err) {
			console.log(err)
			return
		}
		connection.query(config.querries.updatelocation, [JSON.stringify(emails), placeID], (err, result) => {
			if (err) {
				console.log(err)
				return
			}
		})
		connection.release()
	})
}

const { default: axios } = require("axios")

/**
 *
 * @param {Array<String>} domains
 * @returns
 */
async function getEmailsFromDomain(domain, placeID) {
	//? app.outscraper.com?query=1&query=2&query=3
	var host = new URL(domain.website).hostname

	var url = "https://api.app.outscraper.com/emails-and-contacts"
	console.log(url)
	console.log(host)
	axios
		.get(url, {
			headers: {
				"X-API-KEY": process.env.OUTSCRAPERKEY,
			},
			params: {
				query: host,
				async: false,
			},
		})
		.then(function (response) {
			var emailList = []
			if (response.data.data[0].emails) {
				response.data.data[0].emails.forEach((element) => emailList.push(element.value))
			}

			if (response.data.data[0]["external_emails"]) {
				response.data.data[0]["external_emails"].forEach((element) => emailList.push(element.value))
			}
			updateLocation(placeID, emailList)
			//! database.update(domain.placeID, { emails: response.data })
		})
		.catch(function (error) {
			console.log(error)
		})
}

async function getEmails(data) {
	for (let i = 0; i < data.locations.length; i++) {
		if (data.locations[i].website) {
			await delay(100)
			getEmailsFromDomain(data.locations[i], data.locations[i].placeID)
		}
	}
}

module.exports = {
	//getCityByID,
	getCityByName,
	updateLocation,
}
