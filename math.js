var config = require("./config.json")
/**
 *
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Boolean} globe
 * @returns [r, theta, phi] degrees
 */
function cartesianToGlobe(x, y, z) {
	var r = Math.sqrt(x * x + y * y + z * z) //? radius
	var phi = -(Math.acos(z / r) * (180 / Math.PI) - 90) //? up and down on the sphere
	var theta = Math.acos(x / Math.sqrt(x * x + y * y)) * ((Math.abs(y) * 180) / (y * Math.PI)) //? left and right on the sphere
	return [r, theta, phi]
}

/**
 * radians
 * @param {Number} theta [0 - pi)
 * @returns [x, y, z]
 */
function spiralCurve(theta) {
	var x = Math.sin(theta) * Math.cos(theta * config.loops)
	var y = Math.sin(theta) * Math.sin(theta * config.loops)
	var z = Math.cos(theta)
	return [x, y, z]
}

/**
 * radians
 * @param {Number} theta  [0 - pi)
 * @param {Number} step [0 - 2 * pi)
 * @returns [x, y, z]
 */
function latitudeCurve(theta, step) {
	var x = Math.sin(theta) * Math.cos(step)
	var y = Math.sin(theta) * Math.sin(step)
	var z = Math.cos(theta)
	return [x, y, z]
}

/**
 *
 * @param {Number} latitude Vertical angle [-90 - 90)
 * @param {Number} longitude  Horizontal angle [-180 - 180)
 * @returns [r, theta, phi]
 */
function findSpiralOnLongitude(latitude, longitude) {
	var theta = latitude * (Math.PI / 180)
	var phi = longitude * (Math.PI / 180)
	//console.log({ theta, phi })
	//console.log(cartesianToGlobe(...spiralCurve(phi / config.loops)))
	for (var i = Math.floor(config.loops / 2); i >= 0; i--) {
		var temp = (phi + 2 * i * Math.PI) / config.loops

		var spiral = cartesianToGlobe(...spiralCurve(temp))
		//console.log("t: " + temp)
		//console.log("s: " + spiral[2] * (Math.PI / 180) + "\n")

		if (spiral[2] * (Math.PI / 180) > theta) {
			//console.log("found")
			return spiral
		}
	}
	throw "Could not find spiral"
}

/**
 *
 * @param {Number} r
 * @param {Number} theta
 * @param {Number} phi
 * @returns {Number} index ID of location
 */
function findNextIndex(r, theta, phi) {
	for (var i = (config.loops * config.loops) / 2; i >= 0; i--) {
		var tempSpiral = cartesianToGlobe(...spiralCurve((i * 2 * Math.PI) / (config.loops * config.loops)))
		//console.log({ i, tempSpiral })
		if (tempSpiral[2] > phi) {
			return i
		}
	}
}
//console.log(findSpiralOnLongitude(37.4224428, -122.0855897))
//console.log(findNextIndex(...findSpiralOnLongitude(37.4224428, -122.0855897)))
module.exports = {
	cartesianToGlobe,
	spiralCurve,
	latitudeCurve,
	findSpiralOnLongitude,
	findNextIndex,
}
