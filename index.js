var loops = 8192 //8192
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
 * @returns
 */
function spiralCurve(theta) {
	var x = Math.sin(theta) * Math.cos(theta * loops)
	var y = Math.sin(theta) * Math.sin(theta * loops)
	var z = Math.cos(theta)
	return [x, y, z]
}

/**
 * radians
 * @param {Number} theta  [0 - pi)
 * @param {Number} step [0 - 2 * pi)
 * @returns
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
 */
function findSpiralOnLongitude(latitude, longitude) {
	var theta = latitude * (Math.PI / 180)
	var phi = longitude * (Math.PI / 180)
	//console.log({ theta, phi })
	//console.log(cartesianToGlobe(...spiralCurve(phi / loops)))
	for (var i = Math.floor(loops / 2); i >= 0; i--) {
		var temp = (phi + 2 * i * Math.PI) / loops

		var spiral = cartesianToGlobe(...spiralCurve(temp))
		//console.log("t: " + temp)
		//console.log("s: " + spiral[2] * (Math.PI / 180) + "\n")

		if (spiral[2] * (Math.PI / 180) > theta) {
			console.log("found")
			return spiral
		}
	}
}
console.log("final: " + findSpiralOnLongitude(4, 131))

function findNextIndex(r, theta, phi) {
	for (var i = (loops * loops) / 2; i >= 0; i--) {
		var tempSpiral = cartesianToGlobe(...spiralCurve((i * 2 * Math.PI) / (loops * loops)))
		//console.log({ i, tempSpiral })
		if (tempSpiral[2] > phi) {
				return i
			
		}
	}
}

console.log("final: " + findNextIndex(...findSpiralOnLongitude(4, 131)))
