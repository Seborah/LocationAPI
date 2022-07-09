const mongoose = require("mongoose")

//? https://mongoosejs.com/docs/schematypes.html#schematype-options
var City = mongoose.Schema({
    latitude: {
        type: Number,
        index:true,
        required: true,
    },
    longitude: {
        type: Number,
        index:true,
        required: true,
    },
    spiralID: {
        type: Number,
        index: true,
        required: true,
    }
})

module.exports = mongoose.model("City", City)