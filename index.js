Error.stackTraceLimit = 25
var express = require("express")
var app = express()
var bodyParser = require("body-parser")
var database = require("./database.js")
var config = require("./config.json")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get("/get/city/name", function (req, res) {
	console.log("city")
	database.getCityByName(req, res)
})
app.get("/get/location/:id", function (req, res) {
	console.log("location")
	database.getCityByName(req, res)
})

app.listen(config.port, function () {
	console.log("Server started on port " + config.port)
})
