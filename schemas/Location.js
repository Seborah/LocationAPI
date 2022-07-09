const mongoose = require("mongoose")

//? https://mongoosejs.com/docs/schematypes.html#schematype-options
var Location = mongoose.Schema({
	placeID: {
		type: String,
		index: true,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	latitude: {
		type: Number,
		index: true,
		required: true,
	},
	longitude: {
		type: Number,
		index: true,
		required: true,
	},
	phoneNumber: {
		type: String,
		required: false,
	},
	emails: {
		type: [String],
		required: false,
	},
	website: {
		type: String,
		required: false,
	},
})

module.exports = mongoose.model("Location", Location)
